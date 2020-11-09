import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { User } from "../../interfaces/interfaces";
import { gql, useQuery, useSubscription } from "@apollo/client";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import WelcomeScreen from "./WelcomeScreen/WelcomeScreen";
import Chat from "./Chat/Chat";
import "./Main.scss";

// to do: check different users limit (21 causing duplicate last user, 11 causing another third unnecessary request)
const usersLimit = 10;

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

  const { data: usersData, client, fetchMore } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: {
      loggedInUserId: loggedInUser.id,
      offset: `${usersOffset}`,
      limit: `${usersLimit}`
    },
    // fetchPolicy: "cache-and-network",
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

      // To do: change the destruct
      const { newMessage } = newMessageData;
      const { senderId, recipientId } = newMessage;
      const otherUser = usersData.getAllUsersExceptLogged?.users.find((user: User) => user.id === senderId || user.id === recipientId);

      if (otherUser) {
        // console.log(otherUser);
        // console.log(newMessage);

        cache.modify({
          id: cache.identify(otherUser),
          fields: {
            firstName() {
              return newMessage;
            }
          }
        });

        console.log(cache.identify(otherUser));

      } else {
        // To do: compute offset + limit to cover all users from last user to the index of the sender.
        // think about the intersection observer at edge cases like this

        fetchMore({
          variables: {
            loggedInUserId: loggedInUser.id,
            offset: `${usersOffset + 1}`,
            limit: `${usersLimit}`
          }
        });
      }
    }

    // eslint-disable-next-line
  }, [newMessageData]);

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