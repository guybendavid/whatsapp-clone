import React, { useState, useEffect, SyntheticEvent, useContext } from "react";
import { AppContext } from "../../../../contexts/AppContext";
import { User } from "../../../../interfaces/interfaces";
import { gql, useMutation } from "@apollo/client";
import { IconButton, InputBase } from "@material-ui/core";
import MoodIcon from "@material-ui/icons/Mood";
import AttachmentIcon from "@material-ui/icons/Attachment";
import MicIcon from "@material-ui/icons/Mic";

const SEND_MESSAGE = gql`
mutation SendMessage($recipientId: ID! $content: String!) {
  sendMessage(recipientId: $recipientId content: $content) {
    id
  }
}
`;

interface Props {
  selectedUser: User;
}

const BottomSection: React.FC<Props> = ({ selectedUser }) => {
  const { handlerErrors } = useContext(AppContext);
  const initialMessageObj = { content: "", recipientId: selectedUser.id };
  const [messageInput, setMessageInput] = useState(initialMessageObj);
  const [sendMessage] = useMutation(SEND_MESSAGE);

  useEffect(() => {
    setMessageInput(initialMessageObj);

    // eslint-disable-next-line
  }, [selectedUser]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { content, recipientId } = messageInput;

    if (content && recipientId) {
      const newMessage = { recipientId, content };

      try {
        sendMessage({ variables: { ...newMessage } });
        setMessageInput(initialMessageObj);
      } catch (err) {
        handlerErrors(err);
      }
    }
  };

  return (
    <div className="bottom-section">
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
          />
        </div>
      </form>
      <IconButton>
        <MicIcon />
      </IconButton>
    </div>
  );
};

export default BottomSection;