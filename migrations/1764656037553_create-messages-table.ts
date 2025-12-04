import { MigrationBuilder, PgType } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("messages", {
    id: "id",
    user_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    game_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "games",
      onDelete: "CASCADE",
    },
    message: {
      type: PgType.TEXT,
      notNull: true,
    },
    created_at: {
      type: PgType.TIMESTAMP,
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Indexes for fast lookups
  pgm.createIndex("messages", "game_id");
  pgm.createIndex("messages", "user_id");
  pgm.createIndex("messages", ["game_id", "created_at"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("messages");
}
