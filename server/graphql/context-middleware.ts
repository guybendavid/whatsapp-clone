import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { UserInputError, AuthenticationError } from "apollo-server";
import { getFormValidationErrors } from "@guybendavid/utils";

const { SECRET_KEY } = process.env;

export default (context: any) => {
  if (context.req?.body) {
    const { message } = getFormValidationErrors(context.req.body.variables);
    if (message) throw new UserInputError(message);
  }

  const token = (
    context.req?.headers?.authorization ||
    context.connection.context.authorization
  ).split("Bearer ").pop();

  if (token === "null" && ["LoginUser", "RegisterUser"].includes(context.req.body.operationName)) {
    return context;
  }

  jwt.verify(token, SECRET_KEY as string, (err: VerifyErrors | null, decodedToken?: JwtPayload) => {
    if (err) {
      throw new AuthenticationError("Unauthenticated");
    }

    const { iat, exp, ...relevantUserFields } = decodedToken as JwtPayload;
    context.user = { ...relevantUserFields };
  });

  return context;
};