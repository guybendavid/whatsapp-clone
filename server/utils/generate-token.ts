import { User } from "../types/types";
import jwt from "jsonwebtoken";

const { SECRET_KEY } = process.env;

export const getGenerateToken = (userFields: Omit<User, "username" | "password" | "image">) => {
  if (SECRET_KEY) {
    return jwt.sign({ ...userFields }, SECRET_KEY, { expiresIn: "7 days" });
  }
};
