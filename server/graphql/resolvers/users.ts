import bcrypt from "bcrypt";
import generateToken from "../../utils/generateToken";
import { AuthenticationError, UserInputError, ApolloError } from "apollo-server";
import { QueryTypes } from "sequelize";
import { sequelize, User } from "../../db/models";
import { validateRegisterObj, validateLoginObj } from "../../utils/validatons";
import { User as UserInterface } from "../../db/interfaces/interfaces";
import { imageGenerator } from "../../utils/imageGenerator";

export = {
  Query: {
    getAllUsersExceptLogged: async (parent: any, args: { id: string; }, context: { user: UserInterface; }) => {
      const { id } = args;
      const { user } = context;

      if (!user) {
        throw new AuthenticationError("Unauthenticated");
      }

      const getUsersWithLatestMessage = `select distinct on (u.id) u.id, u.first_name as "firstName",
      u.last_name as "lastName", u.image, m.content, m.created_at as "createdAt" from
      (select m.*, case when sender_id = ? then recipient_id else sender_id end as other_user_id
          from messages m where ? in (m.sender_id, m.recipient_id)) m 
          right join users u on u.id = m.other_user_id where u.id != ?
          order by u.id, m.created_at desc`;

      try {
        const otherUsers = await sequelize.query(getUsersWithLatestMessage, { type: QueryTypes.SELECT, replacements: [id, id, id] });

        otherUsers.map((user: any) => {
          user.latestMessage = { content: user.content, createdAt: user.createdAt };
          delete user.content;
          delete user.createdAt;
        });

        return otherUsers;
      } catch (err) {
        throw new ApolloError(err);
      }
    }
  },
  Mutation: {
    register: async (parent: any, args: UserInterface) => {
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
    login: async (parent: any, args: UserInterface) => {
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