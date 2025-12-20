import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Drop the foreign key constraint to allow game_id = 0 for lobby chat
  // game_id = 0 represents lobby chat (not a real game)
  pgm.sql(`
    ALTER TABLE messages 
    DROP CONSTRAINT IF EXISTS messages_game_id_fkey;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Re-add foreign key constraint
  // Note: This will fail if there are any messages with game_id = 0
  pgm.sql(`
    ALTER TABLE messages 
    ADD CONSTRAINT messages_game_id_fkey 
    FOREIGN KEY (game_id) 
    REFERENCES games(id) 
    ON DELETE CASCADE;
  `);
}

