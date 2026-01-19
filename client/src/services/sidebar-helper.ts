import type { ApolloClient, InMemoryCache } from "@apollo/client";
import type { Message, SidebarUser } from "types/types";
import { getAuthData } from "./auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED } from "./graphql";

type GetUser = (options?: { variables?: Record<string, unknown> }) => void;

type DisplayNewMessageOnSidebarData = {
  cache: InMemoryCache;
  newMessage: Message;
  sidebarUsers: SidebarUser[];
  isMoreUsersToFetch: boolean;
  getUser: GetUser;
};

type displayNewUserOnSidebarData = {
  sidebarNewUser: SidebarUser;
  client: ApolloClient<object>;
};

export const displayNewMessageOnSidebar = ({
  cache,
  newMessage,
  sidebarUsers = [],
  isMoreUsersToFetch,
  getUser
}: DisplayNewMessageOnSidebarData) => {
  const { loggedInUser } = getAuthData();
  const { senderId, recipientId } = newMessage;
  const senderIdString = String(senderId);
  const recipientIdString = String(recipientId);

  const otherUser = sidebarUsers.find((user: SidebarUser) => {
    const userIdString = String(user.id);
    return userIdString === senderIdString || userIdString === recipientIdString;
  });

  if (otherUser) {
    const otherUserId = cache.identify({ __typename: "SidebarUser", id: otherUser.id });
    if (!otherUserId) return;

    cache.modify({
      id: otherUserId,
      fields: {
        latestMessage: () => newMessage
      }
    });

    return;
  }

  if (senderIdString !== String(loggedInUser.id) && !isMoreUsersToFetch) {
    getUser({ variables: { id: senderIdString } });
  }
};

export const displayNewUserOnSidebar = ({ sidebarNewUser, client }: displayNewUserOnSidebarData) => {
  const { loggedInUser } = getAuthData();
  const queryToUpdate = { query: GET_All_USERS_EXCEPT_LOGGED, variables: getUsersQueryVariables(loggedInUser.id as string) };
  const { getAllUsersExceptLogged } = client.readQuery(queryToUpdate);

  const newData = {
    users: [sidebarNewUser],
    totalUsersExceptLoggedUser: getAllUsersExceptLogged.totalUsersExceptLoggedUser
  };

  client.writeQuery({ ...queryToUpdate, data: { getAllUsersExceptLogged: newData } });
};
