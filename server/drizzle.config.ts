import path from "path";
import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const isProd = process.env.NODE_ENV === "production";
const isDrizzleCli = process.argv.some((arg) => arg.includes("drizzle-kit"));
const database = isProd ? process.env.DB_PROD : process.env.DB;
const user = isProd ? process.env.DB_USER_PROD : process.env.DB_USER;
const databaseValue = database ?? "";
const userValue = user ?? "";
const password = isProd ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD;
const host = (isProd ? process.env.DB_HOST_PROD : process.env.DB_HOST) || "localhost";
const port = Number(process.env.DB_PORT || 5432);

if (isDrizzleCli && (!database || !user)) {
  throw new Error("Database configuration is missing");
}

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations-drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host,
    port,
    database: databaseValue,
    user: userValue,
    password,
    ssl: isProd ? { rejectUnauthorized: false } : false
  }
} satisfies Config;
