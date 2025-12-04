import db from "../connection";
import {
  CREATE_GAME,
  GET_GAME_BY_ID,
  GET_ALL_GAMES,
  GET_WAITING_GAMES,
  UPDATE_GAME_STATE,
  DELETE_GAME,
} from "./sql";

export interface Game {
  id: number;
  name: string;
  created_by: number;
  state: string;
  max_players: number;
  current_turn: number | null;
  current_rank: string | null;
  created_at: Date;
  creator_username?: string;
  player_count?: number;
}

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
  state: "waiting" | "playing" | "finished",
): Promise<Game> => {
  return await db.one<Game>(UPDATE_GAME_STATE, [id, state]);
};

const remove = async (id: number): Promise<void> => {
  await db.none(DELETE_GAME, [id]);
};

export { create, getById, getAll, getWaiting, updateState, remove };

