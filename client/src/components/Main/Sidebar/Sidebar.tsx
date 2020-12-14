import React, { useState } from "react";
import { SidebarProps } from "../../../interfaces/interfaces";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";
import "./Sidebar.scss";

const Sidebar: React.FC<SidebarProps> = ({ users, isMoreUsersToFetch, fetchMoreUsers, setSelectedUser }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="sidebar">
      <Actions searchValue={searchValue} setSearchValue={setSearchValue} />
      <UsersList users={users} searchValue={searchValue} isMoreUsersToFetch={isMoreUsersToFetch}
        fetchMoreUsers={fetchMoreUsers} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default Sidebar;