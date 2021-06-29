import jwt from "jsonwebtoken";
import { User } from "../db/interfaces/interfaces";
const { SECRET_KEY } = process.env;

const generateToken = (userFields: User) => {
  if (SECRET_KEY) {
    return jwt.sign({ ...userFields }, SECRET_KEY, { expiresIn: "7d" });
  }
};

export default generateToken;