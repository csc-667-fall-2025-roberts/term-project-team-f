import { configDotenv } from "dotenv";
import pgPromise from "pg-promise";

configDotenv();

const pgp = pgPromise();

const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error("Database url is not available");
}

const db = pgp(connectionString);

export default db;
