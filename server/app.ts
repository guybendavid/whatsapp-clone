import { ApolloServer as ApolloServerDev } from "apollo-server";
import { PubSub } from "graphql-subscriptions";
import { ApolloServer as ApolloServerProd } from "apollo-server-express";
import { getContextMiddleware } from "./graphql/context-middleware";
import { resolversConfig } from "./graphql/resolvers/resolvers-config";
import { sequelize } from "./db/models/models-config";
import { typeDefs } from "./graphql/type-definitions";
import http, { type Server } from "http";
import express from "express";
import path from "path";
import pino from "pino";

export const pubsub = new PubSub();

const { NODE_ENV, LOG_LEVEL, PORT, BASE_URL_PROD } = process.env;
const logger = pino({ level: LOG_LEVEL || "info" });
const serverConfig = { typeDefs, resolvers: resolversConfig, context: getContextMiddleware, subscriptions: { path: "/" } };
const port = PORT || 4000;

const startProductionServer = () => {
  const app = express();
  app.use(express.static(path.join(__dirname, "client")));

  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
  });

  const server = new ApolloServerProd(serverConfig);
  server.applyMiddleware({ app });
  const httpServer = http.createServer(app);
  connect({ server: httpServer, isProd: true });
};

const startDevelopmentServer = () => {
  const server = new ApolloServerDev(serverConfig);
  connect({ server });
};

const connect = async ({ server, isProd }: { server: ApolloServerDev | Server; isProd?: boolean }) => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected!");

    if (isProd) {
      await server.listen(port);
      logger.info(`Server ready at https://${BASE_URL_PROD}`);
      logger.info(`Subscriptions ready at wss://${BASE_URL_PROD}`);
      return;
    }

    const { url } = await (server as ApolloServerDev).listen({ port });
    logger.info(`Server ready at ${url}`);
  } catch (error) {
    logger.error(error as string);
  }
};

if (NODE_ENV === "production") {
  startProductionServer();
  process.exit();
}

startDevelopmentServer();
