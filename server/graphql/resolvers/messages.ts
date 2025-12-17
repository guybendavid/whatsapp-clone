import { UserInputError } from "apollo-server";
import { withFilter } from "graphql-subscriptions";
import { Op } from "sequelize";
import { User, Message } from "../../db/models/models-config";
import { SendMessagePayload, ContextUser } from "../../types/types";
import { pubsub } from "../../app";

export const messageResolvers = {
  Query: {
    getMessages: async (_parent: any, args: { otherUserId: string }, { user }: { user: ContextUser }) => {
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
    sendMessage: async (_parent: any, args: SendMessagePayload, { user }: { user: ContextUser }) => {
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
        (_parent: any, _args: any, _context: any) => pubsub.asyncIterableIterator("NEW_MESSAGE"),
        ({ newMessage }: any, _args: any, { user }: any) => newMessage.senderId === user.id || newMessage.recipientId === user.id
      )
    }
  }
};
