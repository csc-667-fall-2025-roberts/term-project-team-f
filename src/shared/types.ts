// Shared types used across frontend and backend

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface SecureUser extends User {
  password: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: Date;
}

export interface Game {
  id: number;
  name: string;
  created_by: number;
  state: "waiting" | "playing" | "finished";
  max_players: number;
  current_turn: number | null;
  current_rank: string | null;
  pile: string[];
  last_played_count: number;
  last_played_by: number | null;
  created_at: Date;
  creator_username?: string;
  player_count?: number;
}

export interface GamePlayer {
  id: number;
  game_id: number;
  user_id: number;
  hand: string[];
  position: number;
  joined_at: Date;
  username?: string;
  email?: string;
}

