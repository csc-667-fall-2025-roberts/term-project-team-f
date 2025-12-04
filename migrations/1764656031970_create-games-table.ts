import { MigrationBuilder, PgType } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("games", {
    id: "id",
    name: {
      type: PgType.VARCHAR + "(100)",
      notNull: true,
    },
    created_by: {
      type: PgType.INTEGER,
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    state: {
      type: PgType.VARCHAR + "(20)",
      notNull: true,
      default: "'waiting'",
    },
    max_players: {
      type: PgType.INTEGER,
      notNull: true,
      default: 4,
    },
    current_turn: {
      type: PgType.INTEGER,
      references: "users",
      onDelete: "SET NULL",
    },
    current_rank: {
      type: PgType.VARCHAR + "(10)",
    },
    created_at: {
      type: PgType.TIMESTAMP,
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Index on created_by for faster lookups of games by creator
  pgm.createIndex("games", "created_by");

  // Index on state for filtering games by status
  pgm.createIndex("games", "state");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("games");
}
