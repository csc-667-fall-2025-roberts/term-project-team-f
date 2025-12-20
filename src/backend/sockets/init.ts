import { Server as HttpServer, IncomingMessage } from "http";
import { Server } from "socket.io";
import { sessionMiddleware } from "../config/session";
import type { User } from "../../shared/types";
import logger from "../lib/logger";
import { Games, GamePlayers } from "../db";

const VALID_RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function getNextValidRanks(currentRank: string | null): string[] {
  if (!currentRank || !VALID_RANKS.includes(currentRank)) {
    return VALID_RANKS;
  }
  const idx = VALID_RANKS.indexOf(currentRank);
  const up = VALID_RANKS[(idx + 1) % VALID_RANKS.length];
  const down = VALID_RANKS[(idx - 1 + VALID_RANKS.length) % VALID_RANKS.length];
  return [up, down];
}

// Extend the socket request type to include session
interface SessionRequest extends IncomingMessage {
  session: {
    id: string;
    user?: User;
  };
}

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    const req = socket.request as SessionRequest;
    const session = req.session;

    if (!session?.user) {
      logger.warn("Socket connection without user session");
      return;
    }

    logger.info(`Socket connected: ${session.user.username}`);
    socket.join(session.id);
    
    // Auto-join lobby room
    socket.join("lobby");
    logger.info(`User ${session.user.username} joined lobby room`);

    socket.on("joinGameRoom", (gameId: number) => {
      if (!session?.user) return;
      const roomName = gameId === 0 ? "lobby" : `game-${gameId}`;
      socket.join(roomName);
      logger.info(`User ${session.user.username} joined room ${roomName}`);
    });

    socket.on("playCards", async (data: { id: number; cards: string[]; declaredRank: string }) => {
      if (!session?.user) return;
      
      try {
        const game = await Games.getById(data.id);
        
        if (!game) {
          socket.emit("error", "Game not found");
          return;
        }

        // Check if it's the player's turn
        if (game.current_turn !== session.user.id) {
          socket.emit("error", "It's not your turn");
          logger.warn(`User ${session.user.username} tried to play out of turn`);
          return;
        }

        logger.info(`User ${session.user.username} played ${data.cards.length} cards:`, data.cards);
        
        // Get player's hand
        const players = await GamePlayers.getPlayers(data.id);
        const player = players.find((p) => p.user_id === session.user.id);
        
        if (!player || !player.hand) {
          socket.emit("error", "Player not found");
          return;
        }

        // Parse hand
        let hand: string[] = typeof player.hand === "string" ? JSON.parse(player.hand) : player.hand;
        
        // Verify player has these cards
        const validCards = data.cards.every((card) => hand.includes(card));
        if (!validCards) {
          socket.emit("error", "You don't have those cards");
          return;
        }

        // Remove cards from hand
        hand = hand.filter((card) => !data.cards.includes(card));
        await GamePlayers.updateHand(data.id, session.user.id, hand);

        // Add cards to deck pile
        const currentPile = game.pile || [];
        const newPile = [...currentPile, ...data.cards];
        const declaredRank = (data.declaredRank || "").toUpperCase();
        logger.info(`Declared rank received: '${declaredRank}' from ${session.user.username}`);
        
        if (!VALID_RANKS.includes(declaredRank)) {
          socket.emit("error", "Invalid declared rank");
          return;
        }
        
        // Update game state changes to next player
        const playerIds = players.map((p) => p.user_id);
        const currentIndex = playerIds.indexOf(session.user.id);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        const nextPlayerId = playerIds[nextIndex];

        // Update game in database
        logger.info(`Updating pile with ${data.cards.length} cards, last_played_by=${session.user.id}`);
        await Games.updatePile(data.id, newPile, data.cards.length, session.user.id);
        
        logger.info(`Setting turn to ${nextPlayerId} with declared rank '${declaredRank}'`);
        const result = await Games.setCurrentTurnAndRank(data.id, nextPlayerId, declaredRank);
        logger.info(`Turn update result: current_turn=${result?.current_turn}, current_rank=${result?.current_rank}`);

        // Broadcast updated game state to all players
        const updatedGame = await Games.getById(data.id);
        logger.info(`After play, game ${data.id} current_rank=${updatedGame?.current_rank}, last_played_count=${updatedGame?.last_played_count}`);
        const updatedPlayers = await GamePlayers.getPlayers(data.id);
        
        // Check for win condition (empty hand)
        const winner = updatedPlayers.find((p) => {
          const playerHand = typeof p.hand === "string" ? JSON.parse(p.hand) : p.hand;
          return Array.isArray(playerHand) && playerHand.length === 0;
        });
        
        if (winner) {
          // Game ended - winner found
          await Games.updateState(data.id, "finished");
          const finalGame = await Games.getById(data.id);
          const finalPlayers = await GamePlayers.getPlayers(data.id);
          
          io.to(`game-${data.id}`).emit("gameUpdate", {
            game: finalGame,
            players: finalPlayers,
          });
          
          io.to(`game-${data.id}`).emit("gameEnded", {
            winner: winner.username || `Player ${winner.user_id}`,
            winnerId: winner.user_id,
          });
        } else {
          io.to(`game-${data.id}`).emit("gameUpdate", {
            game: updatedGame,
            players: updatedPlayers,
          });

          io.to(`game-${data.id}`).emit("playerAction", {
            type: "playCards",
            userId: session.user.id,
            username: session.user.username,
            cardCount: data.cards.length,
            declaredRank,
          });
        }

      } catch (error) {
        logger.error("Error playing cards:", error);
        socket.emit("error", "Failed to play cards");
      }
    });

    socket.on("challenge", async (data: { id: number }) => {
      if (!session?.user) return;
      const challengerId = session.user.id;
      const challengerName = session.user.username;

      try {
        const game = await Games.getById(data.id);
        if (!game) {
          socket.emit("error", "Game not found");
          return;
        }

        if (!game.last_played_by || !game.last_played_count || game.last_played_count <= 0) {
          socket.emit("error", "Nothing to challenge yet");
          return;
        }

        const players = await GamePlayers.getPlayers(data.id);
        const lastPlayerId = game.last_played_by;
        const lastPlayer = players.find((p) => p.user_id === lastPlayerId);
        if (!lastPlayer) {
          socket.emit("error", "Last player not found");
          return;
        }

        const declaredRank = game.current_rank || "";
        const pile = game.pile || [];
        const count = game.last_played_count;
        if (pile.length < count) {
          socket.emit("error", "Invalid pile state for challenge");
          return;
        }

        const lastCards = pile.slice(pile.length - count);
        const ranks = lastCards.map((c) => c.slice(0, -1).toUpperCase());
        const bullShitter = !declaredRank || ranks.some((r) => r !== declaredRank.toUpperCase());

        // Decide who takes the deck
        const takerId = bullShitter ? lastPlayerId : challengerId;
        const taker = players.find((p) => p.user_id === takerId);
        if (!taker) {
          socket.emit("error", "Player to collect pile not found");
          return;
        }

        // Merge deck into taker's hand
        let takerHand: string[] = Array.isArray(taker.hand)
          ? [...taker.hand]
          : taker.hand
            ? JSON.parse(taker.hand as unknown as string)
            : [];
        takerHand = [...takerHand, ...pile];

        await GamePlayers.updateHand(data.id, takerId, takerHand);

        //Updating deck and played info, set next turn to taker
        await Games.updatePile(data.id, [], 0, null);
        await Games.setCurrentTurnAndRank(data.id, takerId, null);

        const updatedGame = await Games.getById(data.id);
        const updatedPlayers = await GamePlayers.getPlayers(data.id);
        
        // Check for win condition (empty hand)
        const winner = updatedPlayers.find((p) => {
          const playerHand = typeof p.hand === "string" ? JSON.parse(p.hand) : p.hand;
          return Array.isArray(playerHand) && playerHand.length === 0;
        });
        
        if (winner) {
          // Game ended - winner found
          await Games.updateState(data.id, "finished");
          const finalGame = await Games.getById(data.id);
          const finalPlayers = await GamePlayers.getPlayers(data.id);
          
          io.to(`game-${data.id}`).emit("gameUpdate", {
            game: finalGame,
            players: finalPlayers,
          });
          
          io.to(`game-${data.id}`).emit("gameEnded", {
            winner: winner.username || `Player ${winner.user_id}`,
            winnerId: winner.user_id,
          });
        } else {
          io.to(`game-${data.id}`).emit("gameUpdate", {
            game: updatedGame,
            players: updatedPlayers,
          });

          io.to(`game-${data.id}`).emit("playerAction", {
            type: "challengeResult",
            liar: bullShitter,
            challengerId,
            challengerName,
            challengedId: lastPlayerId,
            challengedName: lastPlayer.username,
            declaredRank,
            revealed: lastCards,
          });
        }
      } catch (error) {
        logger.error("Error handling challenge:", error);
        socket.emit("error", "Failed to resolve challenge");
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${session.user?.username}`);
    });
  });

  return io;
};
