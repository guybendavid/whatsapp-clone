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
  query GetAllUsersExceptLogged($loggedInUserId: ID! $offset: String!) {
    getAllUsersExceptLogged(id: $loggedInUserId offset: $offset) {
      id
      firstName
      lastName
      image
      latestMessage {
        content
        createdAt
      }
    }
  }
`;

const GET_TOTAL_USERS_COUNT = gql`
  query GetTotalUsersCount($loggedInUserId: ID!) {
    getTotalUsersCount(id: $loggedInUserId)
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [usersOffset, setUsersOffset] = useState(0);

  const { data: totalUsersCount } = useQuery(GET_TOTAL_USERS_COUNT, {
    variables: {
      loggedInUserId: loggedInUser.id
    },
    onError: (error) => handleErrors(error, history),
    onCompleted: () => clearError()
  });

  const { data: usersData, client, refetch } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: {
      loggedInUserId: loggedInUser.id,
      offset: `${usersOffset}`
    },
    onError: (error) => handleErrors(error, history),
    onCompleted: () => clearError()
  });

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
        // To do: fetch with offset
        refetch();
      }
    }

    // eslint-disable-next-line
  }, [newMessageData]);

  return (
    <div className="main">
      <LeftSidebar users={usersData?.getAllUsersExceptLogged} setSelectedUser={setSelectedUser} />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;