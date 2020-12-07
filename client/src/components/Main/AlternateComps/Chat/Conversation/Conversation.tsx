import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../../../contexts/AppContext";
import { Message } from "../../../../../interfaces/interfaces";
import { Typography } from "@material-ui/core";
import timeDisplayer from "../../../../../services/timeDisplayer";
import "./Conversation.scss";

interface Props {
  messages: Message[];
  chatBottomRef: any;
}

const Conversation: React.FC<Props> = ({ messages, chatBottomRef }) => {
  const { loggedInUser } = useContext(AppContext);
  const [firstIndexOfSeries, setFirstIndexOfSeries] = useState<(number | undefined)[]>([]);

  const generateClasses = (senderId: string, index: number) => {
    let classes = "message";

    if (senderId === loggedInUser.id) {
      classes += " sent-message";
    }

    if (firstIndexOfSeries.includes(index)) {
      classes += " first-of-series";
    }

    return classes;
  };

  useEffect(() => {
    if (messages) {
      const lastMessageOfSeries: Message[] = [];
      // eslint-disable-next-line
      const indexes = messages.map((message: Message, index: number) => {

        if (lastMessageOfSeries.length === 0) {
          lastMessageOfSeries.push(message);
          return index;

        } else {
          const lastMessage = lastMessageOfSeries[lastMessageOfSeries.length - 1];

          if (message.senderId !== lastMessage.senderId) {
            lastMessageOfSeries.push(message);
            return index;
          }
        }
      });

      setFirstIndexOfSeries(indexes);
    }
  }, [messages]);

  return (
    <div className="conversation">
      {messages?.map((message, index) => (
        <div key={index} className={generateClasses(message.senderId, index)}>
          <Typography component="span" className="title">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef}></div>
    </div>
  );
};

export default Conversation;