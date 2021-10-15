import { ApolloClient, QueryLazyOptions } from "@apollo/client";
import { Message, User } from "interfaces/interfaces";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED } from "./graphql";

type GetUser = (options?: QueryLazyOptions<Record<string, any>>) => void;

interface DisplayNewMessageOnSidebarData {
  cache: any;
  newMessage: Message;
  sidebarUsers: User[];
  loggedInUserId?: string;
  isMoreUsersToFetch: boolean;
  getUser: GetUser;
}

interface displayNewUserOnSidebarData {
  sidebarNewUser: User;
  client: ApolloClient<any>;
  loggedInUserId?: string;
}

const displayNewMessageOnSidebar = ({ cache, newMessage, sidebarUsers, loggedInUserId, isMoreUsersToFetch, getUser }: DisplayNewMessageOnSidebarData) => {
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
  } else if (senderId !== loggedInUserId && !isMoreUsersToFetch) {
    getUser({ variables: { id: senderId } });
  }
};

const displayNewUserOnSidebar = ({ sidebarNewUser, client, loggedInUserId }: displayNewUserOnSidebarData) => {
  const queryToUpdate = { query: GET_All_USERS_EXCEPT_LOGGED, variables: getUsersQueryVariables(loggedInUserId as string) };
  const { getAllUsersExceptLogged } = client.readQuery(queryToUpdate);

  const newData = {
    users: [sidebarNewUser],
    totalUsersExceptLoggedUser: getAllUsersExceptLogged.totalUsersExceptLoggedUser
  };

  client.writeQuery({ ...queryToUpdate, data: { getAllUsersExceptLogged: newData } });
};

export { displayNewMessageOnSidebar, displayNewUserOnSidebar };