import jwt from "jsonwebtoken";
import { User } from "../db/interfaces/interfaces";
const { SECRET_KEY } = process.env;

const generateToken = ({ id, firstName, lastName }: User) => {
  if (SECRET_KEY) {
    return jwt.sign({ id, firstName, lastName }, SECRET_KEY, { expiresIn: "7d" });
  }
};

export = generateToken;