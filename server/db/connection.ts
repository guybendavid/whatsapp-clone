import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const getDbConfig = () => {
  const isProd = process.env.NODE_ENV === "production";
  const database = isProd ? process.env.DB_PROD : process.env.DB;
  const user = isProd ? process.env.DB_USER_PROD : process.env.DB_USER;
  const password = isProd ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD;
  const host = (isProd ? process.env.DB_HOST_PROD : process.env.DB_HOST) || "localhost";
  const port = Number(process.env.DB_PORT || 5432);

  if (!database || !user) {
    throw new Error("Database configuration is missing");
  }

  return {
    host,
    port,
    database,
    user,
    password,
    ssl: isProd && {
      rejectUnauthorized: false
    }
  };
};

export const pool = new Pool(getDbConfig());

export const db = drizzle(pool);
