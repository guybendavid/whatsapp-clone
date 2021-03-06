import express from "express";
import { ApolloServer as ApolloServerDev } from "apollo-server";
import { ApolloServer as ApolloServerProd } from "apollo-server-express";
import { sequelize } from "./db/models/modelsConfig";
import http, { Server } from "http";
import pino from "pino";
import path from "path";
import resolvers from "./graphql/resolvers/resolversConfig";
import typeDefs from "./graphql/typeDefs";
import contextMiddleware from "./utils/contextMiddleware";

const { NODE_ENV, LOG_LEVEL, PORT } = process.env;
const logger = pino({ level: LOG_LEVEL || "info" });
const serverConfig = { typeDefs, resolvers, context: contextMiddleware, subscriptions: { path: "/" } };
const port = PORT || 4000;

const startProductionServer = () => {
  const isProd = true;
  const app = express();

  app.use(express.static(path.join(__dirname, "client")));

  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "index.html"));
  });

  const server = new ApolloServerProd(serverConfig);
  server.applyMiddleware({ app });
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);
  connect(httpServer, isProd);
};

const startDevelopmentServer = () => {
  const server = new ApolloServerDev(serverConfig);
  connect(server);
};

const connect = async (server: ApolloServerDev | Server, isProd?: boolean) => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected!");

    if (isProd) {
      await server.listen(port);
      const baseUrl = "clone-of-whatsapp.herokuapp.com";
      logger.info(`Server ready at https://${baseUrl}`);
      logger.info(`Subscriptions ready at wss://${baseUrl}`);
    } else {
      const { url, subscriptionsUrl } = await (server as ApolloServerDev).listen({ port });
      logger.info(`Server ready at ${url}`);
      logger.info(`Susbscription ready at ${subscriptionsUrl}`);
    }
  } catch (err) {
    logger.error(err);
  }
};

NODE_ENV === "production" ? startProductionServer() : startDevelopmentServer();