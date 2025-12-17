import { getGenerateToken } from "../../utils/generate-token";
import { getTotalUsers, getUsersWithLatestMessage } from "../../db/raw-queries/users";
import { QueryTypes } from "sequelize";
import { sequelize, User } from "../../db/models/models-config";
import { User as UserType, ContextUser, LatestMessage } from "../../types/types";
import { UserInputError } from "apollo-server";
import bcrypt from "bcrypt";
// eslint-disable-next-line
const generateImage = require("../../utils/generate-image");

interface GetUsersWithLatestMessageResponse extends Omit<ContextUser, "username" | "password">, LatestMessage {}

export const userResolvers = {
  Query: {
    getAllUsersExceptLogged: async (
      _parent: any,
      args: { id: string; offset: string; limit: string },
      _context: { user: ContextUser }
    ) => {
      const { id, offset, limit } = args;
      const [totalUsers] = await sequelize.query(getTotalUsers, { type: QueryTypes.SELECT });
      const totalUsersExceptLoggedUser = totalUsers.count > 0 ? totalUsers.count - 1 : 0;

      if (totalUsersExceptLoggedUser === 0) {
        return { users: [], totalUsersExceptLoggedUser };
      }

      const getSidebarUsersChunk = getUsersWithLatestMessage({ offset, limit });

      const sidebarUsersChunk = await sequelize.query(getSidebarUsersChunk, {
        type: QueryTypes.SELECT,
        replacements: [id, id, id, offset, limit]
      });

      const formattedSidebarUsersChunk = sidebarUsersChunk.map(
        ({ content, createdAt, ...rest }: GetUsersWithLatestMessageResponse) => ({
          latestMessage: { content, createdAt },
          ...rest
        })
      );

      return { users: formattedSidebarUsersChunk, totalUsersExceptLoggedUser };
    },
    getUser: async (_parent: any, args: { id: string }, _context: { user: ContextUser }) => {
      const { id } = args;
      const user = await User.findOne({ where: { id } });
      return user;
    }
  },
  Mutation: {
    register: async (_parent: any, args: Omit<UserType, "id">) => {
      const { firstName, lastName, username, password } = args;
      const isUserExists = await User.findOne({ where: { username } });

      if (isUserExists) {
        throw new UserInputError("Username already exists");
      }

      const hasedPassword = await bcrypt.hash(password as string, 6);
      const user = await User.create({ firstName, lastName, username, password: hasedPassword, image: generateImage() });
      const { password: _userPassword, ...safeUserData } = user.toJSON();
      return { user: safeUserData, token: getGenerateToken({ id: user.id, firstName, lastName }) };
    },
    login: async (_parent: any, args: Pick<UserType, "username" | "password">) => {
      const { username, password } = args;
      const user = await User.findOne({ where: { username } });

      if (!user) {
        throw new UserInputError("User not found");
      }

      const correctPassword = await bcrypt.compare(password as string, user.password);

      if (!correctPassword) {
        throw new UserInputError("Password is incorrect");
      }

      const { id, firstName, lastName, image } = user;
      return { user: { id, firstName, lastName, username, image }, token: getGenerateToken({ id, firstName, lastName }) };
    }
  }
};
