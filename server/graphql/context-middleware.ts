import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { UserInputError, AuthenticationError, PubSub } from "apollo-server";
import { getFormValidationErrors } from "@guybendavid/utils";

const { SECRET_KEY } = process.env;
const pubsub = new PubSub();
const authOperations = ["LoginUser", "RegisterUser"];

const authMiddleware = (context: any) => {
  const token = (
    context.req?.headers?.authorization ||
    context.connection.context.authorization
  ).split("Bearer ")[1];

  if (SECRET_KEY) {
    jwt.verify(token, SECRET_KEY, (_err: VerifyErrors | null, decodedToken?: JwtPayload) => (context.user = decodedToken));
  }

  if (!context.user && !authOperations.includes(context.req?.body?.operationName)) {
    throw new AuthenticationError("Unauthenticated");
  }

  context.pubsub = pubsub;
};

const validationMiddleware = (context: any) => {
  if (!context.req?.body) return;
  const { operationName, variables } = context.req.body;

  if ([...authOperations, "SendMessage"].includes(operationName)) {
    const { message } = getFormValidationErrors(variables);

    if (message) {
      throw new UserInputError(message);
    }
  }
};

const contextMiddleware = (context: any) => {
  authMiddleware(context);
  validationMiddleware(context);
  return context;
};

export default contextMiddleware;