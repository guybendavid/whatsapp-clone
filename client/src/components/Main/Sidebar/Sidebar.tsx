import { useState, useEffect } from "react";
import { css } from "@emotion/css";
import { useAppContext } from "#root/client/contexts/app-context";
import { useQuery, useLazyQuery } from "@apollo/client";
import { getAuthData } from "#root/client/services/auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER } from "#root/client/services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "#root/client/services/sidebar-helper";
import { Actions } from "#root/client/components/Main/Sidebar/Actions/Actions";
import { UsersList } from "#root/client/components/Main/Sidebar/UsersList/UsersList";
import type { InMemoryCache } from "@apollo/client";
import type { SidebarUser, Message } from "#root/client/types/types";

type Props = {
  newMessage?: Message;
  selectedUser?: SidebarUser;
  setSelectedUser: (user: SidebarUser) => void;
};

export const Sidebar = ({ selectedUser, setSelectedUser, newMessage }: Props) => {
  const { loggedInUser } = getAuthData();
  const { handleServerErrors } = useAppContext();
  const [searchValue, setSearchValue] = useState("");

  const {
    data,
    fetchMore: fetchMoreUsers,
    client,
    error: usersError
  } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id)
  });

  const sidebarData = data?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;
  const [getUser, { data: newUserData, error: userError }] = useLazyQuery(GET_USER);

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
  }, [newMessage]);

  useEffect(() => {
    if (usersError) {
      handleServerErrors(usersError);
    }
  }, [usersError]);

  useEffect(() => {
    if (userError) {
      handleServerErrors(userError);
    }
  }, [userError]);

  useEffect(() => {
    if (newMessage && newUserData) {
      const { recipientId, senderId, ...userLatestMessageProperties } = newMessage;
      const sidebarNewUser = { ...newUserData.getUser };
      sidebarNewUser.latestMessage = { ...userLatestMessageProperties };
      displayNewUserOnSidebar({ sidebarNewUser, client });
    }
  }, [newUserData]);

  return (
    <div className={chatStyle}>
      <Actions setSearchValue={setSearchValue} />
      <UsersList
        searchValue={searchValue}
        users={sidebarData?.users}
        isMoreUsersToFetch={isMoreUsersToFetch}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        fetchMoreUsers={fetchMoreUsers}
      />
    </div>
  );
};

const chatStyle = css`
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 353px;
  flex: 0.3;
`;
