import express from "express";
import { Games } from "../db";

const router = express.Router();

router.get("/", async (request, response) => {
  const { user } = request.session;

  try {
    const games = await Games.getWaiting();
    response.render("lobby/lobby", { user, games });
  } catch (error) {
    console.error("Failed to fetch games:", error);
    response.render("lobby/lobby", { user, games: [] });
  }
});

export default router;
