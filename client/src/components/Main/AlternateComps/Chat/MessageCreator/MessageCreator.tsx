import { useState, SyntheticEvent, useContext, useEffect } from "react";
import { css } from "@emotion/css";
import { baseSearchInputStyle } from "styles/reusable-css-in-js-styles";
import { AppContext, AppContextType } from "contexts/AppContext";
import { SidebarUser } from "types/types";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "services/graphql";
import { IconButton, InputBase } from "@material-ui/core";
import { getFormValidationErrors } from "@guybendavid/utils";
import { Mood as MoodIcon, Attachment as AttachmentIcon, Mic as MicIcon } from "@material-ui/icons";

type Props = {
  selectedUser: SidebarUser;
};

const MessageCreator = ({ selectedUser }: Props) => {
  const { handleServerErrors, setSnackBarError } = useContext(AppContext) as AppContextType;
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage("");
  }, [selectedUser]);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => setMessage(""),
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
  };

  return (
    <div className={style}>
      {[MoodIcon, AttachmentIcon].map((Icon, index) => (
        <IconButton key={index}>
          <Icon />
        </IconButton>
      ))}
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <InputBase
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-color);
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  width: 100%;
  padding: 10px 15px;

  form {
    ${baseSearchInputStyle};
    padding: 0 10px;

    .input-wrapper {
      padding: 5px 0 5px 20px;
    }
  }

  svg {
    font-size: 1.7rem !important;
  }
`;