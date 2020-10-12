import userResolvers from "./users";
import messageResolvers from "./messages";

export = {
  Message: {
    createdAt: (parent: any) => parent.createdAt?.toISOString()
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