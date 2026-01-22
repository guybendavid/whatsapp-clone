import type { Config } from "drizzle-kit";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const isProd = process.env.NODE_ENV === "production";
const database = isProd ? process.env.DB_PROD : process.env.DB;
const user = isProd ? process.env.DB_USER_PROD : process.env.DB_USER;
const password = isProd ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD;
const host = (isProd ? process.env.DB_HOST_PROD : process.env.DB_HOST) || "localhost";
const port = Number(process.env.DB_PORT || 5432);

if (!database || !user) {
  throw new Error("Database configuration is missing");
}

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations-drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host,
    port,
    database,
    user,
    password,
    ssl: isProd ? { rejectUnauthorized: false } : false
  }
} satisfies Config;
