import { useState, SyntheticEvent, useContext } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { User } from "interfaces/interfaces";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "services/graphql";
import { IconButton, InputBase } from "@material-ui/core";
import { getFormValidationErrors } from "@guybendavid/utils";
import MoodIcon from "@material-ui/icons/Mood";
import AttachmentIcon from "@material-ui/icons/Attachment";
import MicIcon from "@material-ui/icons/Mic";
import "./MessageCreator.scss";

interface Props {
  selectedUser: User;
}

const MessageCreator = ({ selectedUser }: Props) => {
  const { handleServerErrors, setSnackBarError } = useContext(AppContext) as AppContextType;
  const [message, setMessage] = useState("");

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (error) => handleServerErrors(error)
  });


  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const sendMessagePayload = { content: message, recipientId: selectedUser.id };
    const { message: errorMessage } = getFormValidationErrors(sendMessagePayload);

    if (errorMessage) {
      setSnackBarError(errorMessage);
      return;
    }

    await sendMessage({ variables: sendMessagePayload });
    setMessage("");
  };

  return (
    <div className="message-creator">
      {[MoodIcon, AttachmentIcon].map((Icon, index) => (
        <IconButton key={index}>
          <Icon />
        </IconButton>
      ))}
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <InputBase
            onChange={(e) => setMessage(e.target.value)}
            value={message}
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