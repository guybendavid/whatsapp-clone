import { ApolloClient, QueryLazyOptions } from "@apollo/client";
import { Message, User } from "interfaces/interfaces";
import { getAuthData } from "./auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED } from "./graphql";

type GetUser = (options?: QueryLazyOptions<Record<string, any>>) => void;

interface DisplayNewMessageOnSidebarData {
  cache: any;
  newMessage: Message;
  sidebarUsers: User[];
  isMoreUsersToFetch: boolean;
  getUser: GetUser;
}

interface displayNewUserOnSidebarData {
  sidebarNewUser: User;
  client: ApolloClient<any>;
}

function displayNewMessageOnSidebar({ cache, newMessage, sidebarUsers, isMoreUsersToFetch, getUser }: DisplayNewMessageOnSidebarData) {
  const { loggedInUser } = getAuthData();
  const { senderId, recipientId } = newMessage;
  const otherUserIsDisplayedOnSidebar = sidebarUsers?.find((user: User) => user.id === senderId || user.id === recipientId);

  if (otherUserIsDisplayedOnSidebar) {
    cache.modify({
      id: cache.identify(otherUserIsDisplayedOnSidebar),
      fields: {
        latestMessage() {
          return newMessage;
        }
      }
    });
  } else if (senderId !== loggedInUser.id && !isMoreUsersToFetch) {
    getUser({ variables: { id: senderId } });
  }
};

function displayNewUserOnSidebar({ sidebarNewUser, client }: displayNewUserOnSidebarData) {
  const { loggedInUser } = getAuthData();
  const queryToUpdate = { query: GET_All_USERS_EXCEPT_LOGGED, variables: getUsersQueryVariables(loggedInUser.id as string) };
  const { getAllUsersExceptLogged } = client.readQuery(queryToUpdate);

  const newData = {
    users: [sidebarNewUser],
    totalUsersExceptLoggedUser: getAllUsersExceptLogged.totalUsersExceptLoggedUser
  };

  client.writeQuery({ ...queryToUpdate, data: { getAllUsersExceptLogged: newData } });
};

export { displayNewMessageOnSidebar, displayNewUserOnSidebar };