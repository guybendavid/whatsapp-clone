import express from "express";
import { ApolloServer as ApolloServerDev, PubSub } from "apollo-server";
import { ApolloServer as ApolloServerProd } from "apollo-server-express";
import { sequelize } from "./db/models/models-config";
import http, { Server } from "http";
import pino from "pino";
import path from "path";
import resolvers from "./graphql/resolvers/resolvers-config";
import typeDefs from "./graphql/type-definitions";
import context from "./graphql/context-middleware";

export const pubsub = new PubSub();

const { NODE_ENV, LOG_LEVEL, PORT, BASE_URL_PROD } = process.env;
const logger = pino({ level: LOG_LEVEL || "info" });
const serverConfig = { typeDefs, resolvers, context, subscriptions: { path: "/" } };
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
  server.installSubscriptionHandlers(httpServer);
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

    const { url, subscriptionsUrl } = await (server as ApolloServerDev).listen({ port });
    logger.info(`Server ready at ${url}`);
    logger.info(`Susbscription ready at ${subscriptionsUrl}`);
  } catch (err) {
    logger.error(err as string);
  }
};

NODE_ENV === "production" ? startProductionServer() : startDevelopmentServer();
