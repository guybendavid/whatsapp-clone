import { SidebarUser } from "types/types";
import { Avatar, Typography, IconButton } from "@material-ui/core";
import { css } from "@emotion/css";
import { getOverflowStyle } from "styles/reusable-css-in-js-styles";
import { timeDisplayer } from "@guybendavid/utils";
import { Search as SearchIcon, MoreVert as MoreVertIcon } from "@material-ui/icons";

type Props = {
  selectedUser: SidebarUser;
};

export const ChatHeader = ({ selectedUser }: Props) => (
  <div className={chatStyle}>
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

const chatStyle = css`
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
        ${getOverflowStyle("265px")};
      }
    }
  }
`;
