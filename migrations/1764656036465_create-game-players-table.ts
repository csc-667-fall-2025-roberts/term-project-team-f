import { MigrationBuilder, PgType } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("game_players", {
    id: "id",
    game_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "games",
      onDelete: "CASCADE",
    },
    user_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    hand: {
      type: PgType.JSON,
      default: pgm.func("'[]'::json"),
    },
    position: {
      type: PgType.INTEGER,
      notNull: true,
      default: 0,
    },
    joined_at: {
      type: PgType.TIMESTAMP,
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Unique constraint: a user can only join a game once
  pgm.addConstraint("game_players", "game_players_unique_user_game", {
    unique: ["game_id", "user_id"],
  });

  // Indexes for fast lookups
  pgm.createIndex("game_players", "game_id");
  pgm.createIndex("game_players", "user_id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("game_players");
}
