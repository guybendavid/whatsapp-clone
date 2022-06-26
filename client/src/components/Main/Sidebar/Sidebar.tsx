import { useContext, useState, useEffect } from "react";
import { css } from "@emotion/css";
import { AppContext, AppContextType } from "contexts/AppContext";
import { useQuery, useLazyQuery, InMemoryCache } from "@apollo/client";
import { getAuthData } from "services/auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER } from "services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "services/sidebar-helper";
import { SidebarUser, Message } from "types/types";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";

type Props = {
  newMessage?: Message;
  selectedUser?: SidebarUser;
  setSelectedUser: (user: SidebarUser) => void;
};

const Sidebar = ({ selectedUser, setSelectedUser, newMessage }: Props) => {
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
    <div className={style}>
      <Actions setSearchValue={setSearchValue} />
      <UsersList searchValue={searchValue} users={sidebarData?.users} isMoreUsersToFetch={isMoreUsersToFetch}
        selectedUser={selectedUser} setSelectedUser={setSelectedUser} fetchMoreUsers={fetchMoreUsers} />
    </div>
  );
};

export default Sidebar;

const style = css`
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 353px;
  flex: 0.3;
`;