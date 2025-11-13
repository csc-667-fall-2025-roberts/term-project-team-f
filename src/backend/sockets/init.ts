import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { sessionMiddleware } from "../config/session";
import { User } from "../types/types";
import logger from "../lib/logger";
export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);
  io.on("connection", (socket) => {
    // @ts-ignore
    const session = socket.request.session as { id: string; user: User };

    logger.info(`socket for user ${session.user.username} established`);
    socket.join(session.id);

    socket.on("close", () => {
      logger.info(`socket for user ${session.user.username} closed`);
    });
  });

  return io;
};
