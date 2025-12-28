import { userResolvers } from "./users";
import { messageResolvers } from "./messages";

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
