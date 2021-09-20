import jwt from "jsonwebtoken";
import { UserInputError, AuthenticationError, PubSub } from "apollo-server";
import { getErrors } from "./validations";
const { SECRET_KEY } = process.env;
const pubsub = new PubSub();

const contextMiddleware = (context: any) => {
  const authOperations = ["LoginUser", "RegisterUser"];

  const authenticationMiddleware = () => {
    let token;

    if (context.req?.headers?.authorization) {
      token = context.req.headers.authorization.split("Bearer ")[1];
    } else if (context.connection?.context?.authorization) {
      token = context.connection.context.authorization.split("Bearer ")[1];
    }

    if (SECRET_KEY) {
      jwt.verify(token, SECRET_KEY, (_err: any, decodedToken: any) => {
        context.user = decodedToken;
      });
    }

    // Throwing error if the request is not login or register and there is no valid user
    if (!authOperations.includes(context.req?.body?.operationName) && !context.user) {
      throw new AuthenticationError("Unauthenticated");
    }

    context.pubsub = pubsub;
  };

  const validationMiddleware = () => {
    if (context.req?.body) {
      const { operationName, variables } = context.req.body;

      // Check errors only for specific operations (mutations with payload)
      if ([...authOperations, "SendMessage"].includes(operationName)) {
        const errors = getErrors(variables);

        if (errors) {
          throw new UserInputError(errors);
        }
      }
    }
  };

  authenticationMiddleware();
  validationMiddleware();
  return context;
};

export default contextMiddleware;