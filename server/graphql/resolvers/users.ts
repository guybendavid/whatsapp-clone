import bcrypt from "bcrypt";
import generateToken from "../../utils/generate-token";
import { UserInputError } from "apollo-server";
import { QueryTypes } from "sequelize";
import { sequelize, User } from "../../db/models/modelsConfig";
import { User as UserInterface } from "../../db/interfaces/interfaces";
import { getUsersWithLatestMessage } from "../../utils/raw-queries";
// eslint-disable-next-line
const generateImage = require("../../utils/generate-image");

const usersResolver = {
  Query: {
    getAllUsersExceptLogged: async (_parent: any, args: { id: string; offset: string; limit: string; }, _context: { user: UserInterface; }) => {
      const { id, offset, limit } = args;
      const getTotalUsers = "select count(id) from users";
      const getSidebarUsers = getUsersWithLatestMessage(offset, limit);
      let totalUsers = await sequelize.query(getTotalUsers, { type: QueryTypes.SELECT });

      if (totalUsers[0]?.count > 0) {
        totalUsers = totalUsers[0].count - 1;
        const sidebarUsers = await sequelize.query(getSidebarUsers, { type: QueryTypes.SELECT, replacements: [id, id, id, offset, limit] });

        sidebarUsers.forEach((user: any) => {
          user.latestMessage = { content: user.content, createdAt: user.createdAt };
          delete user.content;
          delete user.createdAt;
        });

        return { users: sidebarUsers, totalUsersExceptLoggedUser: totalUsers };
      } else {
        return { users: [], totalUsersExceptLoggedUser: 0 };
      }
    },
    getUser: async (_parent: any, args: { id: string; }, _context: { user: UserInterface; }) => {
      const { id } = args;
      const user = await User.findOne({ where: { id } });
      return user;
    }
  },
  Mutation: {
    register: async (_parent: any, args: UserInterface) => {
      const { firstName, lastName, username, password } = args;
      const isUserExists = await User.findOne({ where: { username } });

      if (isUserExists) {
        throw new UserInputError("Username already exists");
      }

      const hasedPassword = await bcrypt.hash(password as string, 6);
      const image = generateImage();
      const user = await User.create({ firstName, lastName, username, password: hasedPassword, image });
      const { password: _userPassword, ...safeUserData } = user.toJSON();
      return { ...safeUserData, token: generateToken({ id: user.id, firstName, lastName }) };
    },
    login: async (_parent: any, args: UserInterface) => {
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
      return { id, firstName, lastName, username, image, token: generateToken({ id, firstName, lastName }) };
    }
  }
};

export default usersResolver;