import { MigrationBuilder } from "node-pg-migrate";

// NOTE: This migration is a no-op because the users table
// was already created in an earlier migration (1762894348318).
// Keeping this file for migration history consistency.

export async function up(_pgm: MigrationBuilder): Promise<void> {
  // Users table already exists from 1762894348318_create-chat-message-table.ts
  // This is intentionally empty to avoid "table already exists" error
}

export async function down(_pgm: MigrationBuilder): Promise<void> {
  // No-op - the users table is dropped in the original migration's down()
}
