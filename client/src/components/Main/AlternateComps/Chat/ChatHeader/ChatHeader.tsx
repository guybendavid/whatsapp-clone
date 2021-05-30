import { FC } from "react";
import { User } from "interfaces/interfaces";
import { Avatar, Typography, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import timeDisplayer from "services/timeDisplayer";
import "./ChatHeader.scss";

interface Props {
  selectedUser: User;
}

const ChatHeader: FC<Props> = ({ selectedUser }) => {
  return (
    <div className="chat-header">
      <div className="left-side">
        <Avatar className="user-picture" alt="avatar" src={selectedUser.image} />
        <div className="text-wrapper">
          <Typography className="fullname" component="span">{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
          <Typography component="small">{timeDisplayer(selectedUser.latestMessage?.createdAt)}</Typography>
        </div>
      </div>
      <div className="right-side">
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