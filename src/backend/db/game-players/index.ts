import db from "../connection";
import {
  JOIN_GAME,
  LEAVE_GAME,
  GET_GAME_PLAYERS,
  GET_PLAYER_IN_GAME,
  GET_PLAYER_COUNT,
  UPDATE_PLAYER_HAND,
  GET_USER_GAMES,
} from "./sql";
import type { GamePlayer } from "../../../shared/types";

export type { GamePlayer };

const join = async (gameId: number, userId: number): Promise<GamePlayer> => {
  return await db.one<GamePlayer>(JOIN_GAME, [gameId, userId]);
};

const leave = async (gameId: number, userId: number): Promise<void> => {
  await db.none(LEAVE_GAME, [gameId, userId]);
};

const getPlayers = async (gameId: number): Promise<GamePlayer[]> => {
  return await db.manyOrNone<GamePlayer>(GET_GAME_PLAYERS, [gameId]);
};

const getPlayerInGame = async (
  gameId: number,
  userId: number,
): Promise<GamePlayer | null> => {
  return await db.oneOrNone<GamePlayer>(GET_PLAYER_IN_GAME, [gameId, userId]);
};

const getPlayerCount = async (gameId: number): Promise<number> => {
  const result = await db.one<{ count: string }>(GET_PLAYER_COUNT, [gameId]);
  return parseInt(result.count, 10);
};

const updateHand = async (
  gameId: number,
  userId: number,
  hand: string[],
): Promise<GamePlayer> => {
  return await db.one<GamePlayer>(UPDATE_PLAYER_HAND, [
    gameId,
    userId,
    JSON.stringify(hand),
  ]);
};

const getUserGames = async (userId: number): Promise<GamePlayer[]> => {
  return await db.manyOrNone<GamePlayer>(GET_USER_GAMES, [userId]);
};

export {
  join,
  leave,
  getPlayers,
  getPlayerInGame,
  getPlayerCount,
  updateHand,
  getUserGames,
};

