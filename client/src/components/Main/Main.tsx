import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { User } from "../../interfaces/interfaces";
import { useQuery, useLazyQuery, useSubscription } from "@apollo/client";
import { GET_All_USERS_EXCEPT_LOGGED, GET_USER, NEW_MESSAGE, getUsersQueryVariables } from "../../services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "../../services/MainHelper";
import Sidebar from "./Sidebar/Sidebar";
import WelcomeScreen from "./AlternateComps/WelcomeScreen/WelcomeScreen";
import Chat from "./AlternateComps/Chat/Chat";
import "./Main.scss";

const Main = () => {
  const history = useHistory();
  const loggedInUser = JSON.parse(localStorage.loggedInUser);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { handleErrors, clearError } = useContext(AppContext);

  const { data: usersData, client, fetchMore: fetchMoreUsers } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id),
    onError: (error) => handleErrors(error, history),
    onCompleted: () => clearError()
  });

  const sidebarData = usersData?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;

  const { data: newMessageData } = useSubscription(NEW_MESSAGE);
  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER);

  useEffect(() => {
    if (newMessageData) {
      const { cache } = client;
      const { newMessage } = newMessageData;
      displayNewMessageOnSidebar(cache, newMessage, sidebarData?.users, loggedInUser.id, isMoreUsersToFetch, getUser);
    }
    // eslint-disable-next-line
  }, [newMessageData]);

  useEffect(() => {
    if (newUserData) {
      const sidebarNewUser = { ...newUserData.getUser };
      const { recipientId, senderId, ...userLatestMessageProperties } = newMessageData.newMessage;
      sidebarNewUser.latestMessage = userLatestMessageProperties;
      displayNewUserOnSidebar(sidebarNewUser, client, loggedInUser.id);
    }
    // eslint-disable-next-line
  }, [newUserData]);

  return (
    <div className="main">
      <Sidebar users={sidebarData?.users} isMoreUsersToFetch={isMoreUsersToFetch}
        fetchMoreUsers={fetchMoreUsers} setSelectedUser={setSelectedUser} />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;