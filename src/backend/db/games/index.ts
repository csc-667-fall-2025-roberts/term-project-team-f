import db from "../connection";
import {
  CREATE_GAME,
  GET_GAME_BY_ID,
  GET_ALL_GAMES,
  GET_WAITING_GAMES,
  UPDATE_GAME_STATE,
  START_GAME,
  DELETE_GAME,
  UPDATE_GAME_TURN,
} from "./sql";
import type { Game } from "../../../shared/types";

export type { Game };

const create = async (
  name: string,
  createdBy: number,
  maxPlayers: number = 4,
): Promise<Game> => {
  return await db.one<Game>(CREATE_GAME, [name, createdBy, maxPlayers]);
};

const getById = async (id: number): Promise<Game | null> => {
  return await db.oneOrNone<Game>(GET_GAME_BY_ID, [id]);
};

const getAll = async (): Promise<Game[]> => {
  return await db.manyOrNone<Game>(GET_ALL_GAMES);
};

const getWaiting = async (): Promise<Game[]> => {
  return await db.manyOrNone<Game>(GET_WAITING_GAMES);
};

const start = async (id: number, firstTurnUserId: number): Promise<Game> => {
  return await db.one<Game>(START_GAME, [id, firstTurnUserId]);
};


const updateState = async (
  id: number,
  state: Game["state"],
): Promise<Game> => {
  return await db.one<Game>(UPDATE_GAME_STATE, [id, state]);
};

const remove = async (id: number): Promise<void> => {
  await db.none(DELETE_GAME, [id]);
};

const updatePile = async (
  id: number,
  pile: string[],
  lastPlayedCount: number,
  lastPlayedBy: number | null,
): Promise<Game> => {
  return await db.one<Game>(
    `UPDATE games SET pile = $2, last_played_count = $3, last_played_by = $4 WHERE id = $1 RETURNING *`,
    [id, JSON.stringify(pile), lastPlayedCount, lastPlayedBy]
  );
};

const setCurrentTurnAndRank = async (
  id: number,
  userId: number,
  currentRank: string | null,
): Promise<Game> => {
  return await db.one<Game>(UPDATE_GAME_TURN, [id, userId, currentRank]);
};

export { create, getById, getAll, getWaiting, start, updateState, remove, updatePile, setCurrentTurnAndRank };

