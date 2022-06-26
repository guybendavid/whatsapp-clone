import { SidebarUser } from "types/types";
import { Avatar, Typography, IconButton } from "@material-ui/core";
import { css } from "@emotion/css";
import { overflowHandler } from "styles/reusable-css-in-js-styles";
import { timeDisplayer } from "@guybendavid/utils";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";

type Props = {
  selectedUser: SidebarUser;
};

const ChatHeader = ({ selectedUser }: Props) => {
  return (
    <div className={style}>
      <div className="left-side">
        <Avatar alt="avatar" src={selectedUser.image} />
        <div className="text-wrapper">
          <Typography className="fullname" component="span">{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
          <Typography component="small">{timeDisplayer(selectedUser.latestMessage.createdAt || "")}</Typography>
        </div>
      </div>
      <div>
        {[SearchIcon, MoreVertIcon].map((Icon, index) => (
          <IconButton key={index}>
            <Icon />
          </IconButton>
        ))}
      </div>
    </div>
  );
};

export default ChatHeader;

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-color);
  padding: var(--header-padding);
  border-left: 1px solid lightgray;

  .left-side {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 15px;

    .text-wrapper {
      display: flex;
      flex-direction: column;

      .fullname {
        ${overflowHandler("265px")};
      }
    }
  }
`;