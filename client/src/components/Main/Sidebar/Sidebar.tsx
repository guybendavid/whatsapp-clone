import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../../../contexts/AppContext";
import { useQuery, useLazyQuery } from "@apollo/client";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER } from "../../../services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "../../../services/SidebarHelper";
import { User, Message } from "../../../interfaces/interfaces";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";
import "./Sidebar.scss";

interface Props {
  setSelectedUser: (user: User) => void;
  newMessage?: Message;
}

const Sidebar: React.FC<Props> = ({ setSelectedUser, newMessage }) => {
  const { handleErrors } = useContext(AppContext);
  const [searchValue, setSearchValue] = useState("");
  const history = useHistory();
  const loggedInUser = JSON.parse(localStorage.loggedInUser);

  const { data, fetchMore: fetchMoreUsers, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id),
    onError: (error) => handleErrors(error, history)
  });

  const sidebarData = data?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;

  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER, {
    onError: (error) => handleErrors(error, history)
  });

  useEffect(() => {
    if (newMessage) {
      displayNewMessageOnSidebar(client.cache, newMessage, sidebarData?.users, loggedInUser.id, isMoreUsersToFetch, getUser);
    }
    // eslint-disable-next-line
  }, [newMessage]);

  useEffect(() => {
    if (newMessage && newUserData) {
      const { recipientId, senderId, ...userLatestMessageProperties } = newMessage;
      const sidebarNewUser = { ...newUserData.getUser };
      sidebarNewUser.latestMessage = userLatestMessageProperties;
      displayNewUserOnSidebar(sidebarNewUser, client, loggedInUser.id);
    }
    // eslint-disable-next-line
  }, [newUserData]);

  return (
    <div className="sidebar">
      <Actions searchValue={searchValue} setSearchValue={setSearchValue} />
      <UsersList users={sidebarData?.users} searchValue={searchValue} isMoreUsersToFetch={isMoreUsersToFetch}
        fetchMoreUsers={fetchMoreUsers} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default Sidebar;