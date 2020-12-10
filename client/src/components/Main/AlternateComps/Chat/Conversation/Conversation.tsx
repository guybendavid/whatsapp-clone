import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AppContext } from "../../../../../contexts/AppContext";
import { Message } from "../../../../../interfaces/interfaces";
import { Typography } from "@material-ui/core";
import { getMessagesSqlClauses } from "../../../../../services/graphql";
import { messagesIdentifier, classesGenerator } from "../../../../../services/ConversationHelper";
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
  const [firstIndexesOfSeries, setFirstIndexesOfSeries] = useState<(number | undefined)[]>([]);
  const observer: any = useRef();

  useEffect(() => {
    if (messages) {
      messagesIdentifier(messages, setFirstIndexesOfSeries);
    }
  }, [messages]);

  const firstMessageRef = useCallback(node => {
    if (messages.length > 0) {
      observer.current?.disconnect();

      // To do: invoke it only after scrollbar has reached to bottom and check apollo provider
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

  return (
    <div className="conversation">
      {messages?.map((message, index) => (
        <div key={index} className={classesGenerator(message.senderId, loggedInUser.id, firstIndexesOfSeries, index)}
          // ref={index === 0 ? firstMessageRef : null}
        >
          <Typography component="span" className="title">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef}></div>
    </div>
  );
};

export default Conversation;