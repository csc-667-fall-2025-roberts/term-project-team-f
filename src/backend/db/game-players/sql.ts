export const JOIN_GAME = `
INSERT INTO game_players (game_id, user_id, position)
VALUES ($1, $2, (SELECT COALESCE(MAX(position), 0) + 1 FROM game_players WHERE game_id = $1))
RETURNING id, game_id, user_id, position, joined_at
`;

export const LEAVE_GAME = `
DELETE FROM game_players
WHERE game_id = $1 AND user_id = $2
`;

export const GET_GAME_PLAYERS = `
SELECT 
  game_players.*,
  users.username,
  users.email
FROM game_players
JOIN users ON users.id = game_players.user_id
WHERE game_players.game_id = $1
ORDER BY game_players.position ASC
`;

export const GET_PLAYER_IN_GAME = `
SELECT 
  game_players.*,
  users.username
FROM game_players
JOIN users ON users.id = game_players.user_id
WHERE game_players.game_id = $1 AND game_players.user_id = $2
`;

export const GET_PLAYER_COUNT = `
SELECT COUNT(*) as count
FROM game_players
WHERE game_id = $1
`;

export const UPDATE_PLAYER_HAND = `
UPDATE game_players
SET hand = $3
WHERE game_id = $1 AND user_id = $2
RETURNING *
`;

export const GET_USER_GAMES = `
SELECT 
  games.*,
  game_players.position,
  game_players.joined_at
FROM game_players
JOIN games ON games.id = game_players.game_id
WHERE game_players.user_id = $1
ORDER BY game_players.joined_at DESC
`;

