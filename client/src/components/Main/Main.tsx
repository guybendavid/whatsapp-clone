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
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);

  useEffect(() => {
    if (newMessageData?.newMessage) {
      const { cache } = client;
      const { newMessage } = newMessageData;
      const { senderId, recipientId } = newMessage;
      const otherUserOnSidebar = sidebarData?.users.find((user: User) => user.id === senderId || user.id === recipientId);

      if (otherUserOnSidebar) {
        cache.modify({
          id: cache.identify(otherUserOnSidebar),
          fields: {
            latestMessage() {
              return newMessage;
            }
          }
        });
        // To do: && isScrolledToBottom
      } else if (senderId !== loggedInUser.id) {
        try {
          // To do: any
          const { getAllUsersExceptLogged }: any = client.readQuery({
            query: GET_All_USERS_EXCEPT_LOGGED,
            variables
          });

          console.log(getAllUsersExceptLogged);
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
      <LeftSidebar users={sidebarData?.users} limit={sqlClauses.limit}
        isFetchMoreUsers={sidebarData?.users.length < sidebarData?.totalUsersCountExceptLoggedUser}
        fetchMore={fetchMore} setSelectedUser={setSelectedUser}
      />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;