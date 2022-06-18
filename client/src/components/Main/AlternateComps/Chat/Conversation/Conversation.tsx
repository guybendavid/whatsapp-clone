import { useMemo, RefObject } from "react";
import { getAuthData } from "services/auth";
import { Message } from "types/types";
import { Typography } from "@material-ui/core";
import { classNamesGenerator, timeDisplayer } from "@guybendavid/utils";
import "./Conversation.scss";

export type ConversationMessage = Omit<Message, "recipientId">;

type Props = {
  messages?: ConversationMessage[];
  chatBottomRef: RefObject<HTMLDivElement>;
};

const Conversation = ({ messages = [], chatBottomRef }: Props) => {
  const { loggedInUser } = getAuthData();

  const firstIndexesOfSeries = useMemo(() => {
    if (messages.length === 0) return [];
    const firstMessagesOfSeries: ConversationMessage[] = [];

    // eslint-disable-next-line
    const indexes = messages.map((message: ConversationMessage, index: number) => {
      if (firstMessagesOfSeries.length === 0) {
        firstMessagesOfSeries.push(message);
        return index;
      } else {
        const lastMessageInArr = firstMessagesOfSeries[firstMessagesOfSeries.length - 1];

        if (message.senderId !== lastMessageInArr.senderId) {
          firstMessagesOfSeries.push(message);
          return index;
        }
      }
    });

    return indexes;
  }, [messages]);

  return (
    <div className="conversation">
      {messages.map((message, index) => (
        <div key={index} className={classNamesGenerator("message",
          message.senderId === loggedInUser.id && "is-sent-message",
          firstIndexesOfSeries.includes(index) && "first-of-series")}>
          <Typography component="span">{message.content}</Typography>
          <Typography component="small">{timeDisplayer(message.createdAt)}</Typography>
        </div>
      ))}
      <div className="chat-bottom" ref={chatBottomRef} />
    </div>
  );
};

export default Conversation;