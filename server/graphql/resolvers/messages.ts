import { UserInputError, ApolloError, withFilter, PubSub } from "apollo-server";
import { Op } from "sequelize";
import { User, Message } from "../../db/models/modelsConfig";
import { Message as MessageInterface, User as IUser } from "../../db/interfaces/interfaces";

const messagesResolver = {
  Query: {
    getMessages: async (_parent: any, args: { otherUserId: string; }, { user }: { user: IUser; }) => {
      const { otherUserId } = args;

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
    sendMessage: async (_parent: any, args: MessageInterface, { user, pubsub }: { user: IUser; pubsub: PubSub; }) => {
      const { recipientId, content } = args;

      if (recipientId.toString() === user.id.toString()) {
        throw new UserInputError("You cant message yourself");
      }

      try {
        const message = await Message.create({ senderId: user.id, recipientId, content });
        pubsub.publish("NEW_MESSAGE", { newMessage: message });
        return message;
      } catch (err) {
        throw new ApolloError(err);
      }
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter((_parent, _args, { pubsub }) => {
        return pubsub.asyncIterator(["NEW_MESSAGE"]);
      }, ({ newMessage }, _args, { user }) => newMessage.senderId === user.id || newMessage.recipientId === user.id)
    }
  }
};

export default messagesResolver;