export const CREATE_MESSAGE = `
INSERT INTO chat_messages (user_id, message)
VALUES ($1, $2)
RETURNING id, user_id, message, created_at
`;

// get most recent messages in descending order
export const RECENT_MESSAGES = `
SELECT 
  chat_messages.*, users.username, users.email
FROM chat_messages, users
WHERE users.id = chat_messages.user_id
ORDER BY chat_messages.created_at DESC
LIMIT $1
`;
