import { MigrationBuilder, PgType } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns("games", {
    pile: {
      type: PgType.JSONB,
      notNull: false,
    },
    last_played_count: {
      type: PgType.INTEGER,
      notNull: true,
      default: 0,
    },
    last_played_by: {
      type: PgType.INTEGER,
      references: "users",
      onDelete: "SET NULL",
    },
  });

  // Set default values for existing rows
  pgm.sql("UPDATE games SET pile = '[]'::jsonb WHERE pile IS NULL;");
  
  // Make pile NOT NULL after setting defaults
  pgm.alterColumn("games", "pile", { notNull: true });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("games", ["pile", "last_played_count", "last_played_by"]);
}
