import { useEffect, useRef, useContext } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { SidebarUser, Message } from "types/types";
import { useQuery } from "@apollo/client";
import { css, cx } from "@emotion/css";
import { container } from "../shared-styles";
import { GET_MESSAGES } from "services/graphql";
import { addNewMessageToChat } from "services/chat-helper";
import ChatHeader from "./ChatHeader/ChatHeader";
import Conversation from "./Conversation/Conversation";
import MessageCreator from "./MessageCreator/MessageCreator";

type Props = {
  selectedUser: SidebarUser;
  newMessage?: Message;
};

const Chat = ({ selectedUser, newMessage }: Props) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { handleServerErrors } = useContext(AppContext) as AppContextType;

  const { data, client } = useQuery(GET_MESSAGES, {
    variables: { otherUserId: selectedUser.id },
    onError: (error) => handleServerErrors(error)
  });

  // eslint-disable-next-line
  const messages = data?.getMessages || [];

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    if (newMessage && !messages.some((message: Message) => message.id === newMessage.id)) {
      const { recipientId, ...relevantMessageFields } = newMessage;
      addNewMessageToChat(relevantMessageFields, client, selectedUser.id);
      selectedUser.latestMessage = { ...newMessage };
      chatBottomRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line
  }, [newMessage]);

  return (
    <div className={cx(style, container)}>
      <ChatHeader selectedUser={selectedUser} />
      <Conversation messages={messages} chatBottomRef={chatBottomRef} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;

const style = css`
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f8f9fa;
  border-radius: 10px;
`;
