import { ChatMessage } from "../../types/types";
import db from "../connection";
import { CREATE_MESSAGE, RECENT_MESSAGES } from "./sql";

const list = async (gameId: number, limit: number = 50) => {
  return await db.manyOrNone<ChatMessage>(RECENT_MESSAGES, [gameId, limit]);
};

const create = async (user_id: string, message: string, game_id: number) => {
  return await db.one(CREATE_MESSAGE, [user_id, game_id, message]);
};

export { list, create };
