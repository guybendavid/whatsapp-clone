import bcrypt from "bcrypt";
import generateToken from "../../utils/generate-token";
import { UserInputError } from "apollo-server";
import { QueryTypes } from "sequelize";
import { sequelize, User } from "../../db/models/models-config";
import { User as UserType } from "../../db/types/types";
import { getTotalUsers, getUsersWithLatestMessage } from "../../db/raw-queries/users";
// eslint-disable-next-line
const generateImage = require("../../utils/generate-image");

export default {
  Query: {
    getAllUsersExceptLogged: async (_parent: any, args: { id: string; offset: string; limit: string; }, _context: { user: Omit<UserType, "id">; }) => {
      const { id, offset, limit } = args;
      const [totalUsers] = await sequelize.query(getTotalUsers, { type: QueryTypes.SELECT });

      if (totalUsers?.count === 0) {
        return { users: [], totalUsersExceptLoggedUser: 0 };
      }

      const getSidebarUsers = getUsersWithLatestMessage(offset, limit);
      const sidebarUsers = await sequelize.query(getSidebarUsers, { type: QueryTypes.SELECT, replacements: [id, id, id, offset, limit] });

      const formattedSidebarUsers = sidebarUsers.map(({ content, createdAt, ...rest }: any) => ({
        latestMessage: { content, createdAt },
        ...rest
      }));

      return { users: formattedSidebarUsers, totalUsersExceptLoggedUser: totalUsers.count - 1 };
    },
    getUser: async (_parent: any, args: { id: string; }, _context: { user: UserType; }) => {
      const { id } = args;
      const user = await User.findOne({ where: { id } });
      return user;
    }
  },
  Mutation: {
    register: async (_parent: any, args: UserType) => {
      const { firstName, lastName, username, password } = args;
      const isUserExists = await User.findOne({ where: { username } });

      if (isUserExists) {
        throw new UserInputError("Username already exists");
      }

      const hasedPassword = await bcrypt.hash(password as string, 6);
      const user = await User.create({ firstName, lastName, username, password: hasedPassword, image: generateImage() });
      const { password: _userPassword, ...safeUserData } = user.toJSON();
      return { user: safeUserData, token: generateToken({ id: user.id, firstName, lastName }) };
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
      return { user: { id, firstName, lastName, username, image }, token: generateToken({ id, firstName, lastName }) };
    }
  }
};