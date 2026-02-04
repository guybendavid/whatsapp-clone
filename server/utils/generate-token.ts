import jwt from "jsonwebtoken";
import type { User } from "#root/server/types/types";

const { SECRET_KEY } = process.env;

export const getGenerateToken = (userFields: Omit<User, "username" | "password" | "image">) => {
  if (SECRET_KEY) {
    return jwt.sign(userFields, SECRET_KEY, { expiresIn: "7 days" });
  }
};
