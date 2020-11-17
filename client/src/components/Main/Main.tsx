import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { User } from "../../interfaces/interfaces";
import { gql, useQuery, useLazyQuery, useSubscription } from "@apollo/client";
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

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      firstName
      lastName
      image
    }
  }
`;

const NEW_MESSAGE = gql`
  subscription NewMessage {
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
  const loggedInUser = JSON.parse(localStorage.loggedInUser);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { handleErrors, clearError } = useContext(AppContext);

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
  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER);

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
      } else if (senderId !== loggedInUser.id && isSidebarScrolledToBottom) {
        try {
          getUser({ variables: { id: senderId } });
        } catch (err) {
          // To do: check on error, and that the error get cleared
          handleErrors(err);
        }
      }
    }

    // eslint-disable-next-line
  }, [newMessageData]);

  useEffect(() => {
    if (newUserData) {
      const sidebarNewUser = { ...newUserData.getUser };
      const { recipientId, senderId, ...neededMessageProperties } = newMessageData.newMessage;
      sidebarNewUser.latestMessage = neededMessageProperties;

      const { getAllUsersExceptLogged }: any = client.readQuery({
        query: GET_All_USERS_EXCEPT_LOGGED,
        variables
      });

      // To do: check a senario that after a newUser like this sends his first message, he sends another one very quick
      const updatedSidebar = { ...getAllUsersExceptLogged };
      updatedSidebar.users = [...updatedSidebar.users, sidebarNewUser];
      updatedSidebar.totalUsersCountExceptLoggedUser = `${Number(updatedSidebar.totalUsersCountExceptLoggedUser) + 1}`;

      client.writeQuery({
        query: GET_All_USERS_EXCEPT_LOGGED,
        variables,
        data: {
          getAllUsersExceptLogged: updatedSidebar
        }
      });
    }
    // eslint-disable-next-line
  }, [newUserData]);

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