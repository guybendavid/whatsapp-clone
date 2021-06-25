import { ApolloServer } from "apollo-server";
import { sequelize } from "./db/models/modelsConfig";
import resolvers from "./graphql/resolvers/resolversConfig";
import typeDefs from "./graphql/typeDefs";
import contextMiddleware from "./utils/contextMiddleware";
import pino from "pino";

const { LOG_LEVEL, PORT } = process.env;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  subscriptions: { path: "/" }
});

const logger = pino({ level: LOG_LEVEL || "info" });

const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected!");
    const { url, subscriptionsUrl } = await server.listen({ port: PORT || 4000 });
    logger.info(`Server ready at ${url}`);
    logger.info(`Susbscription ready at ${subscriptionsUrl}`);
  } catch (err) {
    logger.error(err);
  }
};

connectToDB();