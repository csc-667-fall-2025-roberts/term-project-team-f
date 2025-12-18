export const CREATE_GAME = `
INSERT INTO games (name, created_by, max_players, state)
VALUES ($1, $2, $3, 'waiting')
RETURNING id, name, created_by, state, max_players, created_at
`;

export const GET_GAME_BY_ID = `
SELECT 
  games.*,
  users.username as creator_username
FROM games
JOIN users ON users.id = games.created_by
WHERE games.id = $1
`;

export const GET_ALL_GAMES = `
SELECT 
  games.*,
  users.username as creator_username,
  (SELECT COUNT(*) FROM game_players WHERE game_players.game_id = games.id) as player_count
FROM games
JOIN users ON users.id = games.created_by
ORDER BY games.created_at DESC
`;

export const GET_WAITING_GAMES = `
SELECT 
  games.*,
  users.username as creator_username,
  (SELECT COUNT(*) FROM game_players WHERE game_players.game_id = games.id) as player_count
FROM games
JOIN users ON users.id = games.created_by
WHERE games.state = 'waiting'
ORDER BY games.created_at DESC
`;

export const UPDATE_GAME_STATE = `
UPDATE games
SET state = $2
WHERE id = $1
RETURNING *
`;

export const UPDATE_GAME_TURN = `
UPDATE games
SET current_turn = $2, current_rank = $3
WHERE id = $1
RETURNING *
`;

export const DELETE_GAME = `
DELETE FROM games
WHERE id = $1
`;

