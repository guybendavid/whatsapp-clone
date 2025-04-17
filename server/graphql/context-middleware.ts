import jwt, { JwtPayload } from "jsonwebtoken";
import { UserInputError, AuthenticationError } from "apollo-server";
import { getFormValidationErrors } from "@guybendavid/utils";

const { SECRET_KEY } = process.env;

export default (context: any) => {
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
    const { iat, exp, ...relevantUserFields } = decodedToken;
    context.user = { ...relevantUserFields };
  } catch (err) {
    throw new AuthenticationError("Unauthenticated");
  }

  return context;
};
