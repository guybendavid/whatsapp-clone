import { useState, MouseEvent, Fragment } from "react";
import { getAuthData, logout } from "services/auth";
import { Avatar, IconButton, InputBase, ClickAwayListener, Menu, MenuItem } from "@material-ui/core";
import { classNamesGenerator } from "@guybendavid/utils";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownWardIcon from "@material-ui/icons/ArrowDownward";
import "./Actions.scss";

interface Props {
  setSearchValue: (value: string) => void;
}

const Actions = ({ setSearchValue }: Props) => {
  const { loggedInUser } = getAuthData();
  const [searchBarIsOpened, setSearchBarIsOpened] = useState(false);

  return (
    <div className="actions">
      <div className="icons">
        <div className="left-side">
          <Avatar className="avatar" alt="avatar" src={loggedInUser?.image} />
        </div>
        <div className="right-side">
          {[DonutLargeIcon, ChatIcon, DotsIcon].map((Icon, index) => (
            <Fragment key={index}>
              {index < 2 ?
                <IconButton>
                  <Icon />
                </IconButton> :
                <Icon />}
            </Fragment>
          ))}
        </div>
      </div>
      <div className={classNamesGenerator("form-wrapper", searchBarIsOpened && "white")}>
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
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={() => setSearchBarIsOpened(prevState => !prevState)}
                  placeholder={searchBarIsOpened ? "" : "Search or start new chat"}
                />
              </div>
            </div>
          </form>
        </ClickAwayListener>
      </div>
    </div>
  );
};

const DotsIcon = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default Actions;