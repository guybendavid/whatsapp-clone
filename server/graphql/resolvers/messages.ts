import { UserInputError } from "apollo-server";
import { withFilter } from "graphql-subscriptions";
import { Op } from "sequelize";
import { User, Message } from "../../db/models/models-config";
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
      const otherUser = await User.findOne({ where: { id: otherUserId } });

      if (!otherUser) {
        throw new UserInputError("User not found");
      }

      const ids = [user.id, otherUserId];

      const messages = await Message.findAll({
        where: {
          senderId: { [Op.in]: ids },
          recipientId: { [Op.in]: ids }
        },
        order: [["createdAt", "ASC"]]
      });

      return messages;
    }
  },
  Mutation: {
    sendMessage: async (_parent: unknown, args: SendMessagePayload, { user }: GraphQLContext) => {
      const { recipientId, content } = args;

      if (recipientId.toString() === user.id.toString()) {
        throw new UserInputError("You can't message yourself");
      }

      const message = await Message.create({ senderId: user.id, recipientId, content });
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
          return newMessage.senderId === user.id || newMessage.recipientId === user.id;
        }
      )
    }
  }
};
