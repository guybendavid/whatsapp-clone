import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppContext } from "../../../../../contexts/AppContext";
import { Message } from "../../../../../interfaces/interfaces";
import { Typography } from "@material-ui/core";
import { getMessagesSqlClauses } from "../../../../../services/graphql";
import timeDisplayer from "../../../../../services/timeDisplayer";
import "./Conversation.scss";

interface Props {
  messages: Message[];
  isMoreMessagesToFetch: boolean;
  chatBottomRef: any;
  fetchMoreMessages: (obj: any) => void;
}

const Conversation: React.FC<Props> = ({ messages, isMoreMessagesToFetch, chatBottomRef, fetchMoreMessages }) => {
  const { loggedInUser } = useContext(AppContext);
  const [firstIndexOfSeries, setFirstIndexOfSeries] = useState<(number | undefined)[]>([]);
  const observer: any = useRef();

  const firstMessageRef = useCallback(node => {
    if (messages.length > 0) {
      observer.current?.disconnect();

      // To do: fix on first load

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && isMoreMessagesToFetch && loggedInUser.id) {
          fetchMoreMessages({
            variables: {
              loggedInUserId: loggedInUser.id,
              offset: `${messages.length}`,
              limit: `${getMessagesSqlClauses.limit}`
            }
          });
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    }

    // eslint-disable-next-line
  }, [loggedInUser, messages, isMoreMessagesToFetch]);

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
        <div key={index} className={generateClasses(message.senderId, index)} ref={index === 0 ? firstMessageRef : null}>
          <Typography component="span" className="title">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef}></div>
    </div>
  );
};

export default Conversation;