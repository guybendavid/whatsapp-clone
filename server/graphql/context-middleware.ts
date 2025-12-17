import { getFormValidationErrors } from "@guybendavid/utils";
import { UserInputError, AuthenticationError } from "apollo-server";
import jwt, { JwtPayload } from "jsonwebtoken";

const { SECRET_KEY } = process.env;

export const contextMiddleware = (context: any) => {
  if (context.req?.body) {
    const { message } = getFormValidationErrors(context.req.body.variables);
    if (message) throw new UserInputError(message);
  }

  const token = (context.req?.headers?.authorization || context.connection.context.authorization).split("Bearer ").pop();

  if (token === "null" && ["LoginUser", "RegisterUser"].includes(context.req.body.operationName)) {
    return context;
  }

  try {
    const decodedToken = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
    const { iat: _iat, exp: _exp, ...relevantUserFields } = decodedToken;
    context.user = { ...relevantUserFields };
  } catch {
    throw new AuthenticationError("Unauthenticated");
  }

  return context;
};
