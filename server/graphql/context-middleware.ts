import { getFormValidationErrors } from "@guybendavid/utils";
import { UserInputError, AuthenticationError } from "apollo-server";
import jwt, { JwtPayload } from "jsonwebtoken";

const getIsRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  return !Array.isArray(value);
};

const getSecretKey = (): string => {
  const { SECRET_KEY } = process.env;

  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is missing");
  }

  return SECRET_KEY;
};

const getJwtPayloadOrThrow = (value: unknown): JwtPayload => {
  if (!getIsRecord(value)) {
    throw new AuthenticationError("Unauthenticated");
  }

  return value as JwtPayload;
};

const getBearerToken = (rawAuthorization: string): string => {
  const trimmed = rawAuthorization.trim();
  if (!trimmed) return "";

  const bearerPrefix = "Bearer ";
  const tokenCandidate = trimmed.startsWith(bearerPrefix) ? trimmed.slice(bearerPrefix.length) : trimmed;
  const token = tokenCandidate.trim();

  if (!token) return "";
  return token;
};

type GraphQLContextLike = {
  req?: {
    body?: {
      variables?: unknown;
      operationName?: string;
    };
    headers?: {
      authorization?: string;
    };
  };
  connection?: {
    context?: {
      authorization?: string;
    };
  };
  user?: unknown;
};

export const getContextMiddleware = (context: GraphQLContextLike) => {
  if (context.req?.body) {
    const variables = getIsRecord(context.req.body.variables) ? context.req.body.variables : {};
    const { message } = getFormValidationErrors(variables);
    if (message) throw new UserInputError(message);
  }

  const rawAuthorization = context.req?.headers?.authorization ?? context.connection?.context?.authorization ?? "";
  const operationName = context.req?.body?.operationName ?? "";

  if (["LoginUser", "RegisterUser"].includes(operationName)) {
    return context;
  }

  const token = getBearerToken(rawAuthorization);

  if (!token) {
    throw new AuthenticationError("Unauthenticated");
  }

  try {
    const decodedToken = getJwtPayloadOrThrow(jwt.verify(token, getSecretKey()));
    const { iat: _iat, exp: _exp, ...relevantUserFields } = decodedToken;
    context.user = { ...relevantUserFields };
  } catch {
    throw new AuthenticationError("Unauthenticated");
  }

  return context;
};
