import express from "express";
import { Games, GamePlayers } from "../db";

const router = express.Router();

// GET /games - List all games (API endpoint)
router.get("/", async (request, response) => {
  try {
    const games = await Games.getWaiting();
    response.json({ games });
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch games" });
  }
});

// POST /games - Create a new game
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
    const game = await Games.create(
      name.trim(),
      user.id,
      maxPlayers ? parseInt(maxPlayers, 10) : 4,
    );

    // Auto-join the creator to the game
    await GamePlayers.join(game.id, user.id);

    response.redirect(`/games/${game.id}`);
  } catch (error) {
    console.error("Failed to create game:", error);
    response.status(500).json({ error: "Failed to create game" });
  }
});

// GET /games/:id - View a specific game
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

    response.render("games/game", {
      user,
      game,
      players,
      isPlayer,
    });
  } catch (error) {
    console.error("Failed to fetch game:", error);
    response.status(500).render("errors/error", {
      status: 500,
      message: "Failed to load game",
      stack: null,
    });
  }
});

// POST /games/:id/join - Join a game
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
    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.error("Failed to join game:", error);
    response.status(500).json({ error: "Failed to join game" });
  }
});

// POST /games/:id/leave - Leave a game
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

export default router;

