export const SIGNUP = `
INSERT INTO users (username, email, password)
VALUES ($1, $2, $3)
RETURNING id, username, email, created_at
`;

// Only select needed columns for login
export const LOGIN = `
SELECT id, username, email, password, created_at
FROM users
WHERE username = $1
`;
