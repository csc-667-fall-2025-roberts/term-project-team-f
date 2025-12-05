export const CREATE_MESSAGE = `
INSERT INTO chat_messages (user_id, message)
VALUES ($1, $2)
RETURNING id, user_id, message, created_at
`;

// Get most recent messages with proper JOIN syntax
export const RECENT_MESSAGES = `
SELECT 
  chat_messages.id,
  chat_messages.user_id,
  chat_messages.message,
  chat_messages.created_at,
  users.username
FROM chat_messages
JOIN users ON users.id = chat_messages.user_id
ORDER BY chat_messages.created_at DESC
LIMIT $1
`;
