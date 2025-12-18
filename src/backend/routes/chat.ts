import express from "express";
import { Chat } from "../db";
import * as messageKeys from "../../shared/chat-keys";

const router = express.Router();

// POST /chat - Create a new chat message
router.post(`/:gameId`, async (request, response) => {
  const { user } = request.session;
  const { message } = request.body;
  const { gameId } = request.params;

  if (!user) {
    response.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (!message || message.trim().length === 0) {
    response.status(400).json({ error: "Message cannot be empty" });
    return;
  }

  try {
    const chatMessage = await Chat.create(user.id.toString(), message.trim(), Number(gameId), 
    );

    // Broadcast message to all connected clients
    const io = request.app.get("io");
    const gameId = request.params.gameId;
    io.to(`game-${gameId}`).emit(messageKeys.CHAT_MESSAGE(), {
      ...chatMessage,
      username: user.username,
    });

    response.status(201).json({ success: true, message: chatMessage });
  } catch (error) {
    console.error("Failed to create message:", error);
    response.status(500).json({ error: "Failed to send message" });
  }
});

// GET /chat - Get recent messages (for initial load)
router.get("/", async (request, response) => {
  try {
    const messages = await Chat.list(50);
    response.json({ messages: messages.reverse() });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    response.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
