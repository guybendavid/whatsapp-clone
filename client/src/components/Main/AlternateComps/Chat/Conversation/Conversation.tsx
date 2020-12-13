import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../../../contexts/AppContext";
import { Message } from "../../../../../interfaces/interfaces";
import { Typography } from "@material-ui/core";
import { messagesIdentifier, classesGenerator } from "../../../../../services/ConversationHelper";
import timeDisplayer from "../../../../../services/timeDisplayer";
import "./Conversation.scss";

interface Props {
  messages?: Message[];
  chatBottomRef: any;
}

const Conversation: React.FC<Props> = ({ messages, chatBottomRef }) => {
  const { loggedInUser } = useContext(AppContext);
  const [firstIndexesOfSeries, setFirstIndexesOfSeries] = useState<(number | undefined)[]>([]);

  useEffect(() => {
    if (messages) {
      messagesIdentifier(messages, setFirstIndexesOfSeries);
    }
  }, [messages]);

  return (
    <div className="conversation">
      {messages?.map((message, index) => (
        <div key={index} className={classesGenerator(message.senderId, loggedInUser.id, firstIndexesOfSeries, index)}>
          <Typography component="span" className="title">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef}></div>
    </div>
  );
};

export default Conversation;