import React, { useState } from "react";
import { User } from "../../../interfaces/interfaces";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";
import "./Sidebar.scss";

// To do: maybe move some variables / funcs to appContext, and handle Props Interface duplicates
// make the chat scroll to bottom to be smooth

interface Props {
  users: User[];
  isFetchMoreUsers: boolean;
  fetchMoreUsers: (object: any) => void;
  setSelectedUser: (user: User) => void;
}

const Sidebar: React.FC<Props> = ({ users, isFetchMoreUsers, fetchMoreUsers, setSelectedUser }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="sidebar">
      <Actions searchValue={searchValue} setSearchValue={setSearchValue} />
      <UsersList users={users} searchValue={searchValue} isFetchMoreUsers={isFetchMoreUsers}
        fetchMoreUsers={fetchMoreUsers} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default Sidebar;