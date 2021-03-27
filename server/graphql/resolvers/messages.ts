import { UserInputError, AuthenticationError, ApolloError, withFilter } from "apollo-server";
import { Op } from "sequelize";
import { User, Message } from "../../db/models/modelsConfig";
import { Message as MessageInterface } from "../../db/interfaces/interfaces";
import { validateMessageObj } from "../../utils/validatons";

export = {
  Query: {
    getMessages: async (parent: any, args: { otherUserId: string; }, { user }: any) => {
      const { otherUserId } = args;

      if (!user) {
        throw new AuthenticationError("Unauthenticated");
      }

      try {
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
      } catch (err) {
        throw new ApolloError(err);
      }
    }
  },
  Mutation: {
    sendMessage: async (parent: any, args: MessageInterface, { user, pubsub }: any) => {
      const { recipientId, content } = args;

      if (!user) {
        throw new AuthenticationError("Unauthenticated");
      }

      if (recipientId.toString() === user.id.toString()) {
        throw new UserInputError("You cant message yourself");
      }

      const validateMessage = validateMessageObj(args);

      if (validateMessage.isValid) {
        try {
          const message = await Message.create({ senderId: user.id, recipientId, content });
          pubsub.publish("NEW_MESSAGE", { newMessage: message });
          return message;
        } catch (err) {
          throw new ApolloError(err);
        }
      } else {
        throw new UserInputError(validateMessage.errors[0]);
      }
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter((parent, args, { pubsub, user }) => {
        if (!user) {
          throw new AuthenticationError("Unauthenticated");
        }

        return pubsub.asyncIterator(["NEW_MESSAGE"]);
      }, ({ newMessage }, args, { user }) => newMessage.senderId === user.id || newMessage.recipientId === user.id)
    }
  }
};