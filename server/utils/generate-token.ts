import jwt from "jsonwebtoken";
import { User } from "../db/types/types";
const { SECRET_KEY } = process.env;

export default (userFields: Omit<User, "username" | "password" | "image">) => {
  if (SECRET_KEY) {
    return jwt.sign({ ...userFields }, SECRET_KEY, { expiresIn: "7 days" });
  }
};