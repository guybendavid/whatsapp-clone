import { useState, MouseEvent, Fragment } from "react";
import { getAuthData, logout } from "services/auth";
import { Avatar, IconButton, InputBase, ClickAwayListener, Menu, MenuItem } from "@material-ui/core";
import { css, cx } from "@emotion/css";
import { baseSearchInputStyle } from "styles/reusable-css-in-js-styles";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownWardIcon from "@material-ui/icons/ArrowDownward";

type Props = {
  setSearchValue: (value: string) => void;
};

const Actions = ({ setSearchValue }: Props) => {
  const { loggedInUser } = getAuthData();
  const [searchBarIsOpen, setSearchBarIsOpen] = useState(false);

  return (
    <div className={style}>
      <div className="icons">
        <Avatar className="avatar" alt="avatar" src={loggedInUser.image} />
        <div>
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
      <div className={cx("form-wrapper", searchBarIsOpen && "white")}>
        <ClickAwayListener onClickAway={() => setSearchBarIsOpen(false)}>
          <form>
            <div className="search-wrapper">
              <div className="icon-wrapper">
                {searchBarIsOpen ? <ArrowDownWardIcon className="is-arrow" /> : <SearchIcon />}
              </div>
              <div className="input-wrapper">
                <InputBase
                  className="input-base"
                  inputProps={{ "aria-label": "search" }}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={() => setSearchBarIsOpen(prevState => !prevState)}
                  placeholder={searchBarIsOpen ? "" : "Search or start new chat"}
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
        className="main-menu"
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

const style = css`
  background: var(--gray-color);
  border-bottom: 1px solid var(--divider-color);

  .avatar {
    cursor: pointer;
  }

  .icons {
    padding: var(--header-padding);
  }

  .icons,
  .form-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .form-wrapper {
    transition: 0.3s ease;
    padding: 10px;

    &.white {
      background: #fff;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.08);
    }

    &:not(.white) {
      background: #f6f6f6;
    }

    form {
      ${baseSearchInputStyle};

      .search-wrapper {
        position: relative;
        width: 100%;

        .icon-wrapper {
          margin-left: 17px;
          height: 100%;
          position: absolute;
          display: flex;
          align-items: center;
          color: var(--dark-gray-color);

          .is-arrow {
            color: #33b7f6;
            animation: flip-90 0.3s forwards;

            @keyframes flip-90 {
              100% {
                transform: rotate(90deg);
              }
            }
          }
        }

        .input-base {
          padding-left: 65px;
          cursor: pointer;
        }
      }
    }
  }
}

.main-menu {
  ul {
    padding: 0;

    li {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
`;