import { Message, User } from "../interfaces/interfaces";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED } from "./graphql";

const displayNewMessageOnSidebar = (cache: any, newMessage: Message, sidebarUsers: User[],
  loggedInUserId: string, isMoreUsersToFetch: boolean, getUser: (obj: any) => void) => {

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
    try {
      getUser({ variables: { id: senderId } });
    } catch (err) { }
  }
};

const displayNewUserOnSidebar = (sidebarNewUser: User, client: any, loggedInUserId: string) => {
  const { getAllUsersExceptLogged }: any = client.readQuery({
    query: GET_All_USERS_EXCEPT_LOGGED,
    variables: getUsersQueryVariables(loggedInUserId)
  });

  const newData = {
    users: [sidebarNewUser],
    totalUsersExceptLoggedUser: `${Number(getAllUsersExceptLogged.totalUsersExceptLoggedUser) + 1}`
  };

  client.writeQuery({
    query: GET_All_USERS_EXCEPT_LOGGED,
    variables: getUsersQueryVariables(loggedInUserId),
    data: {
      getAllUsersExceptLogged: newData
    }
  });
};

export { displayNewMessageOnSidebar, displayNewUserOnSidebar };