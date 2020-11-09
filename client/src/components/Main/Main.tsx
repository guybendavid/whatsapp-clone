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

  // To do: check different values with different count of users
  const [sqlClauses, setSqlClauses] = useState({ offset: 0, limit: 10 });
  const { offset, limit } = sqlClauses;

  const { data: usersData, fetchMore, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: {
      loggedInUserId: loggedInUser.id,
      offset: `${offset}`,
      limit: `${limit}`
    },
    onError: (error) => handleErrors(error, history),
    onCompleted: () => {
      clearError();
      setUsers(prevUsers => [...prevUsers, ...sidebarData?.users]);
    }
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
        // To do: cache.modify
      } else if (senderId !== loggedInUser.id) {
        // To do: compute offset + limit to cover all users from last user displayed on sidebar to the index of the newMessage sender.
        // setSqlClauses({ offset: users.length - 1, limit });

        // fetchMore({
        //   variables: {
        //     loggedInUserId: loggedInUser.id,
        //     offset: `${users.length - 1}`,
        //     limit: `${limit}`
        //   },
        //   updateQuery: (prevResult, { fetchMoreResult }) => {
        //     console.log(prevResult);
        //     console.log(fetchMoreResult);
        //   }
        // });
      }
    }

    // eslint-disable-next-line
  }, [newMessageData]);

  return (
    <div className="main">
      <LeftSidebar users={users} isMoreUsersToFetch={offset < sidebarData?.totalUsersCount - limit}
        limit={sqlClauses.limit} fetchMore={fetchMore} setSelectedUser={setSelectedUser} setUsers={setUsers}
      />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;