import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Add indexes on frequently queried columns
  pgm.createIndex("users", "email");
  pgm.createIndex("users", "username");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("users", "email");
  pgm.dropIndex("users", "username");
}
