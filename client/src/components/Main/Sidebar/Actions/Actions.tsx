import { FC, useContext, useState, MouseEvent, Fragment } from "react";
import { AppContext } from "contexts/AppContext";
import { Avatar, IconButton, InputBase, ClickAwayListener, Menu, MenuItem } from "@material-ui/core";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownWardIcon from "@material-ui/icons/ArrowDownward";
import "./Actions.scss";

const DotsIcon = () => {
  const { logout } = useContext(AppContext);
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

interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const Actions: FC<Props> = ({ searchValue, setSearchValue }) => {
  const { loggedInUser } = useContext(AppContext);
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
  );
};

export default Actions;