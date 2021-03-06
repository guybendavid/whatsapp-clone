import { useContext, useState, useEffect } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { useQuery, useLazyQuery } from "@apollo/client";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER } from "services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "services/sidebarHelper";
import { User, Message } from "interfaces/interfaces";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";
import "./Sidebar.scss";

interface Props {
  setSelectedUser: (user: User) => void;
  newMessage: Message;
}

const Sidebar = ({ setSelectedUser, newMessage }: Props) => {
  const { handleErrors } = useContext(AppContext) as AppContextType;
  const [searchValue, setSearchValue] = useState("");
  const loggedInUser = JSON.parse(localStorage.loggedInUser);

  const { data, fetchMore: fetchMoreUsers, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id),
    onError: (error) => handleErrors(error)
  });

  const sidebarData = data?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;

  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER, {
    onError: (error) => handleErrors(error)
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

  const sharedProps = { searchValue };
  const actionsProps = { setSearchValue, ...sharedProps };
  const usersListProps = { users: sidebarData?.users, isMoreUsersToFetch, fetchMoreUsers, setSelectedUser, ...sharedProps };

  return (
    <div className="sidebar">
      <Actions {...actionsProps} />
      <UsersList {...usersListProps} />
    </div>
  );
};

export default Sidebar;