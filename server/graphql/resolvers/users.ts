import bcrypt from "bcrypt";
import generateToken from "../../utils/generateToken";
import { AuthenticationError, UserInputError, ApolloError } from "apollo-server";
import { QueryTypes } from "sequelize";
import { sequelize, User } from "../../db/models/modelsConfig";
import { validateRegisterObj, validateLoginObj } from "../../utils/validatons";
import { User as UserInterface } from "../../db/interfaces/interfaces";
import { getUsersWithLatestMessage } from "../../utils/rawQueries";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const imageGenerator = require("../../utils/imageGenerator");

export = {
  Query: {
    getAllUsersExceptLogged: async (_parent: any, args: { id: string; offset: string; limit: string; }, context: { user: UserInterface; }) => {
      const { id, offset, limit } = args;
      const { user } = context;

      if (!user) {
        throw new AuthenticationError("Unauthenticated");
      }

      const getTotalUsers = "select count(id) from users";
      const getSidebarUsers = getUsersWithLatestMessage(offset, limit);

      try {
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
      } catch (err) {
        throw new ApolloError(err);
      }
    },
    getUser: async (_parent: any, args: { id: string; }, context: { user: UserInterface; }) => {
      const { id } = args;
      const { user } = context;

      if (!user) {
        throw new AuthenticationError("Unauthenticated");
      }

      try {
        const user = await User.findOne({ where: { id } });
        return user;
      } catch (err) {
        throw new ApolloError(err);
      }
    }
  },
  Mutation: {
    register: async (_parent: any, args: UserInterface) => {
      const { firstName, lastName, username, password } = args;
      const validateUser = validateRegisterObj(args);

      if (validateUser.isValid) {
        try {
          const isUserExists = await User.findOne({ where: { username } });

          if (isUserExists) {
            throw new UserInputError("Username already exists");
          }

          const hasedPassword = await bcrypt.hash(password, 6);
          const image = imageGenerator();
          const user = await User.create({ firstName, lastName, username, password: hasedPassword, image });
          const { password: userPassword, ...safeUserData } = user.toJSON();
          return { ...safeUserData, token: generateToken({ id: user.id, firstName, lastName }) };
        } catch (err) {
          throw new ApolloError(err);
        }
      } else {
        throw new UserInputError(validateUser.errors[0]);
      }
    },
    login: async (_parent: any, args: UserInterface) => {
      const { username, password } = args;
      const validateUser = validateLoginObj(args);

      if (validateUser.isValid) {
        try {
          const user = await User.findOne({ where: { username } });

          if (!user) {
            throw new UserInputError("User not found");
          }

          const correctPassword = await bcrypt.compare(password, user.password);

          if (!correctPassword) {
            throw new UserInputError("Password is incorrect");
          }

          const { id, firstName, lastName, image } = user;
          return { id, firstName, lastName, username, image, token: generateToken({ id, firstName, lastName }) };
        } catch (err) {
          throw new ApolloError(err);
        }
      } else {
        throw new UserInputError(validateUser.errors[0]);
      }
    }
  }
};