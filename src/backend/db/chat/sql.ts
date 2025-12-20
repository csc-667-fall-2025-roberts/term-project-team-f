export const CREATE_MESSAGE = `
INSERT INTO messages (user_id, game_id, message)
VALUES ($1, $2, $3)
RETURNING id, user_id, game_id, message, created_at
`;

// Get most recent messages for a specific game with proper JOIN syntax
export const RECENT_MESSAGES = `
SELECT 
  messages.id,
  messages.user_id,
  messages.game_id,
  messages.message,
  messages.created_at,
  users.username
FROM messages
JOIN users ON users.id = messages.user_id
WHERE messages.game_id = $1
ORDER BY messages.created_at DESC
LIMIT $2
`;
