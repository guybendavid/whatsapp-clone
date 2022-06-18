import { UserInputError, withFilter } from "apollo-server";
import { Op } from "sequelize";
import { User, Message } from "../../db/models/models-config";
import { SendMessagePayload, ContextUser } from "../../types/types";
import { pubsub } from "../../app";

export default {
  Query: {
    getMessages: async (_parent: any, args: { otherUserId: string; }, { user }: { user: ContextUser; }) => {
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
    sendMessage: async (_parent: any, args: SendMessagePayload, { user }: { user: ContextUser; }) => {
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
        (_parent, _args, _context) => pubsub.asyncIterator("NEW_MESSAGE"),
        ({ newMessage }, _args, { user }) => newMessage.senderId === user.id || newMessage.recipientId === user.id
      )
    }
  }
};