import { Server as HttpServer, IncomingMessage } from "http";
import { Server } from "socket.io";
import { sessionMiddleware } from "../config/session";
import type { User } from "../../shared/types";
import logger from "../lib/logger";

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

    socket.on("joinGameRoom", (gameId: number) => {
      if (!session?.user) return;
      const roomName = `game-${gameId}`;
      socket.join(roomName);
      logger.info(`User ${session.user.username} joined room ${roomName}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${session.user?.username}`);
    });
  });

  return io;
};
