import { userResolvers } from "#root/server/graphql/resolvers/users";
import { messageResolvers } from "#root/server/graphql/resolvers/messages";

type MessageParent = {
  createdAt: Date | null;
};

export const resolversConfig = {
  Message: {
    createdAt: ({ createdAt }: MessageParent) => createdAt && createdAt.toISOString()
  },
  Query: {
    ...userResolvers.Query,
    ...messageResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...messageResolvers.Mutation
  },
  Subscription: {
    ...messageResolvers.Subscription
  }
};
