import jwt from "jsonwebtoken";
import { PubSub } from "apollo-server";
const pubsub = new PubSub();
const { SECRET_KEY } = process.env;

export = (context: any) => {
  let token;

  if (context.req?.headers?.authorization) {
    token = context.req.headers.authorization.split("Bearer ")[1];
  } else if (context.connection?.context?.authorization) {
    token = context.connection.context.authorization.split("Bearer ")[1];
  }

  if (SECRET_KEY) {
    jwt.verify(token, SECRET_KEY, (err: any, decodedToken: any) => {
      context.user = decodedToken;
    });
  }

  context.pubsub = pubsub;
  return context;
};