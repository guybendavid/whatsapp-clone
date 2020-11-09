import React, { useContext, useState, useRef, useCallback } from "react";
import { AppContext } from "../../../contexts/AppContext";
import { useHistory } from "react-router-dom";
import { User } from "../../../interfaces/interfaces";
import { List, ListItem, Avatar, ListItemAvatar, IconButton, InputBase, Typography, Divider, Menu, MenuItem, ClickAwayListener } from "@material-ui/core";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownWardIcon from "@material-ui/icons/ArrowDownward";
import "./LeftSidebar.scss";

interface Props {
  users: User[];
  isMoreUsersToFetch: boolean;
  limit: number;

  // To do * 3:
  fetchMore: (object: any) => void;
  setUsers: (users: User[]) => void;
  setSqlClauses: (object: any) => void;

  setSelectedUser: (user: User) => void;
}

const DotsIcon = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const history: any = useHistory();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="logout-menu"
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

const LeftSidebar: React.FC<Props> = ({ users, isMoreUsersToFetch, limit, fetchMore, setUsers, setSqlClauses, setSelectedUser }) => {
  const { loggedInUser, displayMessageTime } = useContext(AppContext);
  const [searchBarIsOpened, setSearchBarIsOpened] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const observer: any = useRef();

  const lastUserRef = useCallback(node => {
    // To do: check fast scrolling behavior
    // check why there is another request on each scroll to bottom

    if (users.length > 0) {
      observer.current?.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && isMoreUsersToFetch) {
          fetchMore({
            variables: {
              loggedInUserId: loggedInUser.id,
              offset: `${users.length - 1}`,
              limit: `${limit}`
            },
            // To do: any
            updateQuery: (prevResult: any, { fetchMoreResult }: any) => {
              let { users: newUsers } = fetchMoreResult.getAllUsersExceptLogged;

              if (newUsers) {
                newUsers = [...prevResult.getAllUsersExceptLogged.users, ...newUsers];

                if (users[users.length - 1].id !== newUsers[newUsers.length - 1].id) {
                  // To do: without rendering twice
                  // setSqlClauses({ offset: newUsers.length - 1, limit });
                  setUsers(newUsers);
                }
              }

              return fetchMoreResult;
            }
          });
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    }

    // eslint-disable-next-line
  }, [users, isMoreUsersToFetch]);

  return (
    <div className="left-sidebar">
      <div className="actions">
        <div className="icons">
          <div className="left-side">
            <Avatar className="avatar" alt="avatar" src={loggedInUser?.image} />
          </div>
          <div className="right-side">
            {[DonutLargeIcon, ChatIcon, DotsIcon].map((Icon, index) => (
              <React.Fragment key={index}>
                {index < 2 ?
                  <IconButton>
                    <Icon />
                  </IconButton> :
                  <Icon />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className={"form-wrapper " + (searchBarIsOpened ? "white" : "")}>
          <ClickAwayListener onClickAway={() => setSearchBarIsOpened(false)}>
            <form>
              <div className="search-wrapper">
                <div className="icon-wrapper">
                  {searchBarIsOpened ? <ArrowDownWardIcon className="is-arrow" /> : <SearchIcon />}
                </div>
                <div className="input-wrapper">
                  <InputBase
                    className="input-base"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClick={() => setSearchBarIsOpened(!searchBarIsOpened)}
                    placeholder={searchBarIsOpened ? "" : "Search or start new chat"}
                  />
                </div>
              </div>
            </form>
          </ClickAwayListener>
        </div>
      </div>
      <List className="users">
        {users?.filter(user => `${user.firstName} ${user.lastName}`.toUpperCase().includes(searchValue.toUpperCase())).map((user, index) => (
          <React.Fragment key={index}>
            <ListItem button className="list-item" onClick={() => setSelectedUser(user)}
              ref={users.length === index + 1 ? lastUserRef : null}>
              <ListItemAvatar className="avatar-wrapper">
                <Avatar className="avatar" alt="avatar" src={user?.image} />
              </ListItemAvatar>
              <div className="text-wrapper">
                {index > 0 && <Divider className={user.latestMessage?.createdAt ? "is-chatted" : ""} />}
                <div className="first-row">
                  <Typography component="span" className="fullname">{`${user.firstName} ${user.lastName}`}</Typography>
                  <Typography component="small">{displayMessageTime(user.latestMessage?.createdAt)}</Typography>
                </div>
                <div className="second-row">
                  <Typography className="last-message" component="span">{user.latestMessage?.content}</Typography>
                </div>
              </div>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </div >
  );
};

export default LeftSidebar;