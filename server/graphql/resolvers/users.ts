import { eq, sql } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { db } from "#root/server/db/connection";
import { users } from "#root/server/db/schema";
import { getGenerateToken } from "#root/server/utils/generate-token";
import { getGeneratedImage } from "#root/server/utils/generate-image";
import bcrypt from "bcrypt";
import type { ContextUser, User as UserType } from "#root/server/types/types";

type SidebarUserRow = Record<string, unknown> &
  Omit<ContextUser, "username" | "password"> & {
    image: string | null;
    content: string | null;
    createdAt: Date | null;
  };

export const userResolvers = {
  Query: {
    getAllUsersExceptLogged: async (
      _parent: unknown,
      args: { id: string; offset: string; limit: string },
      _context: { user: ContextUser }
    ) => {
      const { id, offset, limit } = args;
      const totalUsersResult = await db.execute<{ count: string }>(sql`select count(id) as count from users`);
      const totalUsers = Number(totalUsersResult.rows[0]?.count || 0);
      const totalUsersExceptLoggedUser = totalUsers > 0 ? totalUsers - 1 : 0;

      if (totalUsersExceptLoggedUser === 0) {
        return { users: [], totalUsersExceptLoggedUser };
      }

      const offsetValue = Number(offset);
      const limitValue = Number(limit);
      const offsetSql = offset ? sql`offset ${offsetValue}` : sql``;
      const limitSql = limit ? sql`limit ${limitValue}` : sql``;

      const sidebarUsersChunkResult = await db.execute<SidebarUserRow>(sql`
        select distinct on (u.id)
          u.id,
          u.first_name as "firstName",
          u.last_name as "lastName",
          u.image,
          m.content,
          m.created_at as "createdAt"
        from (
          select m.*, case when sender_id = ${id} then recipient_id else sender_id end as other_user_id
          from messages m where ${id} in (m.sender_id, m.recipient_id)
        ) m
        right join users u on u.id = m.other_user_id
        where u.id != ${id}
        order by u.id, m.created_at desc
        ${offsetSql}
        ${limitSql}
      `);

      const sidebarUsersChunk = sidebarUsersChunkResult.rows || [];

      const formattedSidebarUsersChunk = sidebarUsersChunk.map(({ content, createdAt, ...rest }: SidebarUserRow) => ({
        latestMessage: { content, createdAt: createdAt ? createdAt.toISOString() : null },
        ...rest
      }));

      return { users: formattedSidebarUsersChunk, totalUsersExceptLoggedUser };
    },
    getUser: async (_parent: unknown, args: { id: string }, _context: { user: ContextUser }) => {
      const { id } = args;
      const userId = Number(id);
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return user || null;
    }
  },
  Mutation: {
    register: async (_parent: unknown, args: Omit<UserType, "id">) => {
      const { firstName, lastName, username, password } = args;
      const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);

      if (existingUser) {
        throw new GraphQLError("Username already exists", {
          extensions: { code: "BAD_USER_INPUT" }
        });
      }

      const hasedPassword = await bcrypt.hash(password as string, 6);

      const [user] = await db
        .insert(users)
        .values({ firstName, lastName, username, password: hasedPassword, image: getGeneratedImage() })
        .returning();

      if (!user) {
        throw new Error("Failed to create user");
      }

      const { password: _userPassword, ...safeUserData } = user;
      return { user: safeUserData, token: getGenerateToken({ id: String(user.id), firstName, lastName }) };
    },
    login: async (_parent: unknown, args: Pick<UserType, "username" | "password">) => {
      const { username, password } = args;
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "BAD_USER_INPUT" }
        });
      }

      const correctPassword = await bcrypt.compare(password as string, user.password);

      if (!correctPassword) {
        throw new GraphQLError("Password is incorrect", {
          extensions: { code: "BAD_USER_INPUT" }
        });
      }

      const { id, firstName, lastName, image } = user;

      return {
        user: { id, firstName, lastName, username, image },
        token: getGenerateToken({ id: String(id), firstName, lastName })
      };
    }
  }
};
