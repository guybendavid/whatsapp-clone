import { useContext, useState, useEffect } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { useQuery, useLazyQuery, InMemoryCache } from "@apollo/client";
import { getAuthData } from "services/auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER } from "services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "services/sidebar-helper";
import { User, Message } from "types/types";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";
import "./Sidebar.scss";

interface Props {
  setSelectedUser: (user: User) => void;
  newMessage?: Message;
}

const Sidebar = ({ setSelectedUser, newMessage }: Props) => {
  const { loggedInUser } = getAuthData();
  const { handleServerErrors } = useContext(AppContext) as AppContextType;
  const [searchValue, setSearchValue] = useState("");

  const { data, fetchMore: fetchMoreUsers, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id),
    onError: (error) => handleServerErrors(error)
  });

  const sidebarData = data?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;

  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER, {
    onError: (error) => handleServerErrors(error)
  });

  useEffect(() => {
    if (newMessage) {
      displayNewMessageOnSidebar({
        cache: client.cache as InMemoryCache,
        newMessage,
        sidebarUsers: sidebarData?.users,
        isMoreUsersToFetch,
        getUser
      });
    }
    // eslint-disable-next-line
  }, [newMessage]);

  useEffect(() => {
    if (newMessage && newUserData) {
      const { recipientId, senderId, ...userLatestMessageProperties } = newMessage;
      const sidebarNewUser = { ...newUserData.getUser };
      sidebarNewUser.latestMessage = { ...userLatestMessageProperties };
      displayNewUserOnSidebar({ sidebarNewUser, client });
    }
    // eslint-disable-next-line
  }, [newUserData]);

  return (
    <div className="sidebar">
      <Actions setSearchValue={setSearchValue} />
      <UsersList searchValue={searchValue} users={sidebarData?.users} isMoreUsersToFetch={isMoreUsersToFetch}
        fetchMoreUsers={fetchMoreUsers} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default Sidebar;