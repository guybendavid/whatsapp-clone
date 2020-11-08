import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { User } from "../../interfaces/interfaces";
import { gql, useQuery, useSubscription } from "@apollo/client";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import WelcomeScreen from "./WelcomeScreen/WelcomeScreen";
import Chat from "./Chat/Chat";
import "./Main.scss";

// to do: check different users limit (21 causing duplicate last user)
const usersLimit = 21;

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
      totalUsersCount
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

const Main = () => {
  const history = useHistory();
  const loggedInUser = JSON.parse(localStorage.loggedInUser);
  const { handleErrors, clearError } = useContext(AppContext);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersOffset, setUsersOffset] = useState(0);

  const { data: usersData, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: {
      loggedInUserId: loggedInUser.id,
      offset: `${usersOffset}`,
      limit: `${usersLimit}`
    },
    onError: (error) => handleErrors(error, history),
    onCompleted: () => handleCompleted()
  });

  const sidebarData = usersData?.getAllUsersExceptLogged;

  const handleCompleted = () => {
    clearError();
    setUsers(prevUsers => [...prevUsers, ...sidebarData?.users]);
  };

  const { data: newMessageData } = useSubscription(NEW_MESSAGE);

  useEffect(() => {
    if (newMessageData?.newMessage) {
      const { cache } = client;
      const { newMessage } = newMessageData.newMessage;
      const { senderId, recipientId } = newMessageData.newMessage;
      const otherUser = usersData.getAllUsersExceptLogged?.find((user: User) => user.id === senderId || user.id === recipientId);

      if (otherUser) {
        cache.modify({
          id: cache.identify(otherUser),
          fields: {
            latestMessage() {
              return newMessage;
            }
          }
        });
      } else {
        // To do: check
        setUsersOffset(users.length - 1);
      }
    }

    // eslint-disable-next-line
  }, [newMessageData]);

  console.log(usersOffset);

  return (
    <div className="main">
      <LeftSidebar users={users} isMoreUsersToFetch={usersOffset < sidebarData?.totalUsersCount - usersLimit}
        setUsersOffset={setUsersOffset} setSelectedUser={setSelectedUser}
      />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;