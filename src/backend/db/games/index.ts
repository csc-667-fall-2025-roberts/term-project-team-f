import db from "../connection";
import {
  CREATE_GAME,
  GET_GAME_BY_ID,
  GET_ALL_GAMES,
  GET_WAITING_GAMES,
  UPDATE_GAME_STATE,
  DELETE_GAME,
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

const updateState = async (
  id: number,
  state: Game["state"],
): Promise<Game> => {
  return await db.one<Game>(UPDATE_GAME_STATE, [id, state]);
};

const remove = async (id: number): Promise<void> => {
  await db.none(DELETE_GAME, [id]);
};

export { create, getById, getAll, getWaiting, updateState, remove };

