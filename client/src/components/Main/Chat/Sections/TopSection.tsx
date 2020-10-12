import React, { useContext, useEffect } from "react";
import { AppContext } from "../../../../contexts/AppContext";
import { User, Message } from "../../../../interfaces/interfaces";
import { Avatar, Typography, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import MoreVertIcon from "@material-ui/icons/MoreVert";

interface Props {
  selectedUser: User;
  newMessage: Message;
}

const TopSection: React.FC<Props> = ({ selectedUser, newMessage }) => {
  const { displayMessageTime } = useContext(AppContext);

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
    <div className="top-section">
      <div className="left-side">
        <Avatar className="user-picture" alt="avatar"
          src={selectedUser.image} />
        <div className="text-wrapper">
          <Typography className="fullname" component="span">{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
          <Typography component="small">{displayMessageTime(selectedUser.latestMessage?.createdAt)}</Typography>
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

export default TopSection;