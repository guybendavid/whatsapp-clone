import { ApolloClient, InMemoryCache, QueryLazyOptions } from "@apollo/client";
import { Message, SidebarUser } from "types/types";
import { getAuthData } from "./auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED } from "./graphql";

type GetUser = (options?: QueryLazyOptions<Record<string, any>>) => void;

type DisplayNewMessageOnSidebarData = {
  cache: InMemoryCache;
  newMessage: Message;
  sidebarUsers: SidebarUser[];
  isMoreUsersToFetch: boolean;
  getUser: GetUser;
};

type displayNewUserOnSidebarData = {
  sidebarNewUser: SidebarUser;
  client: ApolloClient<any>;
};

export function displayNewMessageOnSidebar({
  cache,
  newMessage,
  sidebarUsers = [],
  isMoreUsersToFetch,
  getUser
}: DisplayNewMessageOnSidebarData) {
  const { loggedInUser } = getAuthData();
  const { senderId, recipientId } = newMessage;
  const otherUser = sidebarUsers.find((user: SidebarUser) => user.id === senderId || user.id === recipientId);
  const isOtherUserDisplayedOnSidebar = Boolean(otherUser);

  if (isOtherUserDisplayedOnSidebar) {
    cache.modify({
      id: cache.identify({ ...otherUser }),
      fields: {
        latestMessage() {
          return newMessage;
        }
      }
    });
  } else if (senderId !== loggedInUser.id && !isMoreUsersToFetch) {
    getUser({ variables: { id: senderId } });
  }
}

export function displayNewUserOnSidebar({ sidebarNewUser, client }: displayNewUserOnSidebarData) {
  const { loggedInUser } = getAuthData();
  const queryToUpdate = { query: GET_All_USERS_EXCEPT_LOGGED, variables: getUsersQueryVariables(loggedInUser.id as string) };
  const { getAllUsersExceptLogged } = client.readQuery(queryToUpdate);

  const newData = {
    users: [sidebarNewUser],
    totalUsersExceptLoggedUser: getAllUsersExceptLogged.totalUsersExceptLoggedUser
  };

  client.writeQuery({ ...queryToUpdate, data: { getAllUsersExceptLogged: newData } });
}
