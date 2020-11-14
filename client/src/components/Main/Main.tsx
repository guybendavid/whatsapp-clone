import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { User } from "../../interfaces/interfaces";
import { gql, useQuery, useSubscription } from "@apollo/client";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import WelcomeScreen from "./WelcomeScreen/WelcomeScreen";
import Chat from "./Chat/Chat";
import "./Main.scss";

const GET_All_USERS_EXCEPT_LOGGED = gql`
  query GetAllUsersExceptLogged($loggedInUserId: ID! $offset: String! $limit: String!) {
    getAllUsersExceptLogged(id: $loggedInUserId offset: $offset limit: $limit) {
      users {
        id
        firstName
        lastName
        image
        latestMessage {
          content
          createdAt
        }
      }
      totalUsersCountExceptLoggedUser
    }
  }
`;

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      senderId
      recipientId
      content
      createdAt
    }
  }
`;

const sqlClauses = { offset: 0, limit: 15 };

const Main = () => {
  const history = useHistory();
  const { handleErrors, clearError } = useContext(AppContext);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const loggedInUser = JSON.parse(localStorage.loggedInUser);

  const variables = {
    loggedInUserId: loggedInUser.id,
    offset: `${sqlClauses.offset}`,
    limit: `${sqlClauses.limit}`
  };

  const { data: usersData, client, fetchMore } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables,
    onError: (error) => handleErrors(error, history),
    onCompleted: () => clearError()
  });

  const sidebarData = usersData?.getAllUsersExceptLogged;
  const isFetchMoreUsers = sidebarData?.users.length < sidebarData?.totalUsersCountExceptLoggedUser;
  const isSidebarScrolledToBottom = !isFetchMoreUsers;

  const { data: newMessageData } = useSubscription(NEW_MESSAGE);

  useEffect(() => {
    if (newMessageData?.newMessage) {
      const { cache } = client;
      const { newMessage } = newMessageData;
      const { senderId, recipientId } = newMessage;
      const otherUserOnSidebar = sidebarData?.users.find((user: User) => user.id === senderId || user.id === recipientId);

      // To do: fix after the object that will be received will changed
      if (otherUserOnSidebar) {
        cache.modify({
          id: cache.identify(otherUserOnSidebar),
          fields: {
            latestMessage() {
              return newMessage;
            }
          }
        });
      } else if (senderId !== loggedInUser.id && isSidebarScrolledToBottom) {
        try {
          const { getAllUsersExceptLogged }: any = client.readQuery({
            query: GET_All_USERS_EXCEPT_LOGGED,
            variables
          });

          // To do: fetch the entire user object with the message he sent and then => 
          // 1. merge the users object that in the cache with this new user
          // 2. if inside a conversation: 
          // distruct the message object from the user object and merge it with the messages object of the conversation that in the cache

        } catch (err) {
          // To do: check on error, and that the error get cleared
          handleErrors(err);
        }
      }
    }

    // eslint-disable-next-line
  }, [newMessageData]);

  return (
    <div className="main">
      <LeftSidebar users={sidebarData?.users} limit={sqlClauses.limit} isFetchMoreUsers={isFetchMoreUsers}
        fetchMore={fetchMore} setSelectedUser={setSelectedUser}
      />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;