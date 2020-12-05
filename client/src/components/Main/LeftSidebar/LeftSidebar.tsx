import React, { useState } from "react";
import { User } from "../../../interfaces/interfaces";
import Actions from "./Sections/Actions";
import UsersList from "./Sections/UsersList";
import "./LeftSidebar.scss";

// To do: rename to just sidebar
// rename fetchMore to fetchMoreUsers
// maybe move some variables / funcs to appContext, and handle Props Interface duplicates
// make the chat scroll to bottom to be smooth

interface Props {
  users: User[];
  isFetchMoreUsers: boolean;
  fetchMore: (object: any) => void;
  setSelectedUser: (user: User) => void;
}

const LeftSidebar: React.FC<Props> = ({ users, isFetchMoreUsers, fetchMore, setSelectedUser }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="left-sidebar">
      <Actions searchValue={searchValue} setSearchValue={setSearchValue} />
      <UsersList users={users} searchValue={searchValue} isFetchMoreUsers={isFetchMoreUsers}
        fetchMore={fetchMore} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default LeftSidebar;