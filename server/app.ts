import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express, { type Request, type Response } from "express";
import { PubSub } from "graphql-subscriptions";
import { useServer as graphqlUseServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";
import { pool } from "#root/server/db/connection";
import { getContextMiddleware } from "#root/server/graphql/context-middleware";
import { resolversConfig } from "#root/server/graphql/resolvers/resolvers-config";
import { typeDefs } from "#root/server/graphql/type-definitions";
import http from "http";
import path from "path";
import pino from "pino";

export const pubsub = new PubSub();

const { NODE_ENV, LOG_LEVEL, PORT, BASE_URL_PROD } = process.env;
const logger = pino({ level: LOG_LEVEL || "info" });
const schema = makeExecutableSchema({ typeDefs, resolvers: resolversConfig });
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
    await pool.query("select 1");
    logger.info("Database connected!");

    const app = express();

    if (isProd) {
      app.use(express.static(path.join(__dirname, "client")));
      app.get("*", (_req: Request, res: Response) => res.sendFile(path.resolve(__dirname, "client", "index.html")));
    }

    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
    });

    await server.start();

    app.use(
      "/",
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }: { req: Request }) => getContextMiddleware({ req })
      })
    );

    const wsServer = new WebSocketServer({ server: httpServer, path: "/" });

    graphqlUseServer(
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
