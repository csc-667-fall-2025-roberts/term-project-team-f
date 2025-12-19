import { createDeck, shuffle, dealAll } from "../engine"
import express, { response } from "express";
import { Games, GamePlayers } from "../db";


const router = express.Router();

// List all games 
router.get("/", async (request, response) => {
  try {
    const games = await Games.getWaiting();
    response.json({ games });
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch games" });
  }
});

// Create a new game
router.post("/", async (request, response) => {
  const { user } = request.session;
  const { name, maxPlayers } = request.body;

  if (!user) {
    response.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (!name || name.trim().length === 0) {
    response.status(400).json({ error: "Game name is required" });
    return;
  }

  try {
    console.log("Creating game:", { name, maxPlayers, userId: user.id });
    const game = await Games.create(
      name.trim(),
      user.id,
      maxPlayers ? parseInt(maxPlayers, 10) : 4,
    );

    console.log("Game created:", game);

    // Auto-join the creator to the game
    await GamePlayers.join(game.id, user.id);

    console.log("Creator joined game");
    response.redirect(`/games/${game.id}`);
  } catch (error) {
    console.error("Failed to create game:", error);
    response.status(500).render("errors/error", {
      status: 500,
      message: `Failed to create game: ${error instanceof Error ? error.message : "Unknown error"}`,
      stack: error instanceof Error ? error.stack : null,
    });
  }
});

// get game state with player's hand 
router.get("/:id/state", async (request, response) => {
  const { user } = request.session;
  const gameId = parseInt(request.params.id, 10);

  if (!user) {
    return response.status(401).json({ error: "Not authenticated" });
  }

  try {
    const game = await Games.getById(gameId);
    
    if (!game) {
      return response.status(404).json({ error: "Game not found" });
    }

    const players = await GamePlayers.getPlayers(gameId);
    const playerData = players.find((p) => p.user_id === user.id);
    
    let playerHand: string[] = [];
    if (playerData && playerData.hand) {
      if (typeof playerData.hand === "string") {
        playerHand = JSON.parse(playerData.hand);
      } else if (Array.isArray(playerData.hand)) {
        playerHand = playerData.hand;
      }
    }

    return response.json({
      game,
      players,
      playerHand,
      currentUserId: user.id,
    });
  } catch (error) {
    console.error("Failed to fetch game state:", error);
    return response.status(500).json({ error: "Failed to fetch game state" });
  }
});

//View a specific game
router.get("/:id", async (request, response) => {
  const { user } = request.session;
  const gameId = parseInt(request.params.id, 10);

  if (isNaN(gameId)) {
    response.status(400).render("errors/error", {
      status: 400,
      message: "Invalid game ID",
      stack: null,
    });
    return;
  }

  try {
    const game = await Games.getById(gameId);

    if (!game) {
      response.status(404).render("errors/error", {
        status: 404,
        message: "Game not found",
        stack: null,
      });
      return;
    }

    const players = await GamePlayers.getPlayers(gameId);
    const isPlayer = players.some((p) => p.user_id === user?.id);

    // Get current player's hand
    let playerHand: string[] = [];
    if (isPlayer && user) {
      const playerData = players.find((p) => p.user_id === user.id);
      console.log(`Player data for user ${user.id}:`, JSON.stringify(playerData, null, 2));
      if (playerData && playerData.hand) {
        if (typeof playerData.hand === "string") {
          playerHand = JSON.parse(playerData.hand);
        } else if (Array.isArray(playerData.hand)) {
          playerHand = playerData.hand;
        } else {
          playerHand = [];
        }
        console.log(`Player ${user.id} final hand:`, playerHand);
      } else {
        console.log(`Player ${user.id} has no hand data yet`);
      }
    }

    response.render("games/game", {
      user,
      game,
      players,
      isPlayer,
      playerHand,
    });
    console.log("Rendering game view with playerHand:", playerHand);
  } catch (error) {
    console.error("Failed to fetch game:", error);
    response.status(500).render("errors/error", {
      status: 500,
      message: "Failed to load game",
      stack: null,
    });
  }
});

// Join a game
router.post("/:id/join", async (request, response) => {
  const { user } = request.session;
  const gameId = parseInt(request.params.id, 10);

  if (!user) {
    response.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const game = await Games.getById(gameId);

    if (!game) {
      response.status(404).json({ error: "Game not found" });
      return;
    }

    if (game.state !== "waiting") {
      response.status(400).json({ error: "Game already started" });
      return;
    }

    const playerCount = await GamePlayers.getPlayerCount(gameId);

    if (playerCount >= game.max_players) {
      response.status(400).json({ error: "Game is full" });
      return;
    }

    const existingPlayer = await GamePlayers.getPlayerInGame(gameId, user.id);

    if (existingPlayer) {
      response.redirect(`/games/${gameId}`);
      return;
    }

    await GamePlayers.join(gameId, user.id);
    
    // Emit socket event to notify other players
    const io = request.app.get("io");
    const updatedGame = await Games.getById(gameId);
    const players = await GamePlayers.getPlayers(gameId);
    io.to(`game-${gameId}`).emit("playerJoined", { game: updatedGame, players });
    
    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.error("Failed to join game:", error);
    response.status(500).json({ error: "Failed to join game" });
  }
});

// Leave a game
router.post("/:id/leave", async (request, response) => {
  const { user } = request.session;
  const gameId = parseInt(request.params.id, 10);

  if (!user) {
    response.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    await GamePlayers.leave(gameId, user.id);
    response.redirect("/lobby");
  } catch (error) {
    console.error("Failed to leave game:", error);
    response.status(500).json({ error: "Failed to leave game" });
  }
});

// Start a game
router.post("/:id/start", async (request, response) => {
  const { user } = request.session;
  const gameId = parseInt(request.params.id, 10);

  //error notifications
  if (!user) {
    response.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (isNaN(gameId)) {
    response.status(400).json({ error: "invalid game ID"});
    return;
  }

  try{
    const game = await Games.getById(gameId);

    if (!game) {
      response.status(404).json({ error: "Game not found"});
      return;
    }


  if (game.created_by !== user.id) {
    response.status(403).json({ error: "Only the host is allowed to start the game" });
    return;
  }

  if (game.state !== "waiting") {
   response.status(400).json({ error: "Game has already started"});
    return;
  }

  const playerCount = await GamePlayers.getPlayerCount(gameId);

  if (playerCount < 2) {
    response.status(400).json({ error: "Not enough players to start a game"});
    return;
  }
    
// Adding hand and deck stuff
const players = await GamePlayers.getPlayers(gameId);
const playerIds = players.map((p) => p.user_id);
const deck = shuffle(createDeck());
const hands = dealAll(deck, playerIds);

console.log("Starting game:", gameId);
console.log("Players:", playerIds);
console.log("Deck size:", deck.length);
console.log("Hands:", hands);
    
for (const pid of playerIds) {
  const hand = hands.get(pid) ?? [];
  console.log(`Updating hand for player ${pid}:`, hand);
  await GamePlayers.updateHand(gameId, pid, hand);
}
await Games.start(gameId, playerIds[0]);

// Emit socket event to notify players game started
const io = request.app.get("io");
const updatedGame = await Games.getById(gameId);
const updatedPlayers = await GamePlayers.getPlayers(gameId);
io.to(`game-${gameId}`).emit("gameStarted", { game: updatedGame, players: updatedPlayers });

return response.redirect(`/games/${gameId}`);

} catch (error) {
  console.error("Failure to start game: ", error);
  return response.status(500).json({ error: "Failure to start game..."});
}


}); 

export default router;

