import { PubSub } from "graphql-subscriptions";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { getContextMiddleware } from "./graphql/context-middleware";
import { resolversConfig } from "./graphql/resolvers/resolvers-config";
import { sequelize } from "./db/models/models-config";
import { typeDefs } from "./graphql/type-definitions";
import http from "http";
import express from "express";
import path from "path";
import pino from "pino";

export const pubsub = new PubSub();

const { NODE_ENV, LOG_LEVEL, PORT, BASE_URL_PROD } = process.env;
const logger = pino({ level: LOG_LEVEL || "info" });
const schema = makeExecutableSchema({ typeDefs, resolvers: resolversConfig });

const serverConfig = {
  schema,
  context: getContextMiddleware
};

const port = PORT || 4000;

const getConnectionContext = (connectionParams: unknown) => {
  if (typeof connectionParams !== "object" || connectionParams === null) {
    return {};
  }

  const params = connectionParams as Record<string, unknown>;
  return typeof params.authorization === "string" ? { authorization: params.authorization } : {};
};

const getSubscriptionContext = (connectionParams: unknown) =>
  getContextMiddleware({
    connection: {
      context: getConnectionContext(connectionParams)
    }
  });

const startServer = async ({ isProd }: { isProd?: boolean }) => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected!");

    const app = express();

    if (isProd) {
      app.use(express.static(path.join(__dirname, "client")));
      app.get("*", (_req, res) => res.sendFile(path.resolve(__dirname, "client", "index.html")));
    }

    const httpServer = http.createServer(app);
    const server = new ApolloServer(serverConfig);
    await server.start();
    server.applyMiddleware({ app, path: "/" });

    const wsServer = new WebSocketServer({ server: httpServer, path: "/" });

    useServer(
      {
        schema,
        context: (ctx) => getSubscriptionContext(ctx.connectionParams)
      },
      wsServer
    );

    if (isProd) {
      httpServer.listen(port);
      logger.info(`Server ready at https://${BASE_URL_PROD}`);
      logger.info(`Subscriptions ready at wss://${BASE_URL_PROD}`);
      return;
    }

    httpServer.listen(port);
    logger.info(`Server ready at http://localhost:${port}/`);
  } catch (error) {
    logger.error(error as string);
  }
};

if (NODE_ENV === "production") {
  startServer({ isProd: true });
}

startServer({ isProd: false });
