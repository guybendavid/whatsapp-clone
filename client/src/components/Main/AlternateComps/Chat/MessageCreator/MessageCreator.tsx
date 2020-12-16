import React, { useState, useEffect, SyntheticEvent, useContext } from "react";
import { AppContext } from "../../../../../contexts/AppContext";
import { User } from "../../../../../interfaces/interfaces";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "../../../../../services/graphql";
import { IconButton, InputBase } from "@material-ui/core";
import MoodIcon from "@material-ui/icons/Mood";
import AttachmentIcon from "@material-ui/icons/Attachment";
import MicIcon from "@material-ui/icons/Mic";
import "./MessageCreator.scss";

interface Props {
  selectedUser: User;
}

const MessageCreator: React.FC<Props> = ({ selectedUser }) => {
  const { handleErrors } = useContext(AppContext);

  const initialMessageObj = { content: "", recipientId: selectedUser.id };
  const [messageInput, setMessageInput] = useState(initialMessageObj);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (error) => handleErrors(error)
  });

  useEffect(() => {
    setMessageInput(initialMessageObj);
    // eslint-disable-next-line
  }, [selectedUser]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { content, recipientId } = messageInput;
    sendMessage({ variables: { recipientId, content } });
    setMessageInput(initialMessageObj);
  };

  return (
    <div className="message-creator">
      {[MoodIcon, AttachmentIcon].map((Icon, index) => (
        <IconButton key={index}>
          <Icon />
        </IconButton>
      ))}
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="input-wrapper">
          <InputBase
            onChange={(e) => setMessageInput({ ...messageInput, content: e.target.value })}
            value={messageInput.content}
            className="input-base"
            placeholder={"Type a message"}
            inputProps={{ "aria-label": "create message" }}
            required
          />
        </div>
      </form>
      <IconButton>
        <MicIcon />
      </IconButton>
    </div>
  );
};

export default MessageCreator;