import { FC, useEffect } from "react";
import { User, Message } from "interfaces/interfaces";
import { Avatar, Typography, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import timeDisplayer from "services/timeDisplayer";
import "./ChatHeader.scss";

interface Props {
  selectedUser: User;
  newMessage?: Message;
}

const ChatHeader: FC<Props> = ({ selectedUser, newMessage }) => {
  useEffect(() => {
    if (newMessage) {
      const { senderId, recipientId } = newMessage;

      if (selectedUser.id === senderId || selectedUser.id === recipientId) {
        selectedUser.latestMessage = newMessage;
      };
    }
    // eslint-disable-next-line
  }, [newMessage]);

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