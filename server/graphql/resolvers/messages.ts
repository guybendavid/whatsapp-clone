import { UserInputError } from "apollo-server";
import { withFilter } from "graphql-subscriptions";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/connection";
import { messages, users } from "../../db/schema";
import type { SendMessagePayload, ContextUser } from "../../types/types";
import { pubsub } from "../../app";

type GraphQLContext = { user: ContextUser };

type NewMessagePayload = {
  newMessage: {
    senderId: string | number;
    recipientId: string | number;
  };
};

const getIsRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  return !Array.isArray(value);
};

const getIsId = (id: unknown): id is string | number => typeof id === "string" || typeof id === "number";

const getIsNewMessagePayload = (value: unknown): value is NewMessagePayload => {
  if (!getIsRecord(value)) return false;
  const { newMessage } = value;
  if (!getIsRecord(newMessage)) return false;
  const { senderId, recipientId } = newMessage;
  return getIsId(senderId) && getIsId(recipientId);
};

export const messageResolvers = {
  Query: {
    getMessages: async (_parent: unknown, args: { otherUserId: string }, { user }: GraphQLContext) => {
      const { otherUserId } = args;
      const otherUserIdValue = Number(otherUserId);
      const userIdValue = Number(user.id);
      const [otherUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, otherUserIdValue)).limit(1);

      if (!otherUser) {
        throw new UserInputError("User not found");
      }

      const ids = [userIdValue, otherUserIdValue];

      return db
        .select()
        .from(messages)
        .where(and(inArray(messages.senderId, ids), inArray(messages.recipientId, ids)))
        .orderBy(asc(messages.createdAt));
    }
  },
  Mutation: {
    sendMessage: async (_parent: unknown, args: SendMessagePayload, { user }: GraphQLContext) => {
      const { recipientId, content } = args;
      const senderIdValue = Number(user.id);
      const recipientIdValue = Number(recipientId);

      if (recipientIdValue === senderIdValue) {
        throw new UserInputError("You can't message yourself");
      }

      const [message] = await db
        .insert(messages)
        .values({ senderId: senderIdValue, recipientId: recipientIdValue, content })
        .returning();

      if (!message) {
        throw new Error("Failed to send message");
      }

      pubsub.publish("NEW_MESSAGE", { newMessage: message });
      return message;
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_parent: unknown, _args: unknown) => pubsub.asyncIterableIterator("NEW_MESSAGE"),
        (payload: unknown, _args: unknown, context?: GraphQLContext) => {
          if (!context) return false;

          const { user } = context;

          if (!getIsNewMessagePayload(payload)) return false;
          const { newMessage } = payload;
          const senderIdString = String(newMessage.senderId);
          const recipientIdString = String(newMessage.recipientId);
          const userIdString = String(user.id);
          return senderIdString === userIdString || recipientIdString === userIdString;
        }
      )
    }
  }
};
