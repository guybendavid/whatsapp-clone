import { useEffect, useRef } from "react";
import { useAppContext } from "#root/client/contexts/app-context";
import { useQuery } from "@apollo/client";
import { css, cx } from "@emotion/css";
import { containerStyle } from "#root/client/components/Main/AlternateComps/shared-styles";
import { GET_MESSAGES } from "#root/client/services/graphql";
import { addNewMessageToChat } from "#root/client/services/chat-helper";
import { ChatHeader } from "#root/client/components/Main/AlternateComps/Chat/ChatHeader/ChatHeader";
import { Conversation } from "#root/client/components/Main/AlternateComps/Chat/Conversation/Conversation";
import { MessageCreator } from "#root/client/components/Main/AlternateComps/Chat/MessageCreator/MessageCreator";
import type { SidebarUser, Message } from "#root/client/types/types";

type Props = {
  selectedUser: SidebarUser;
  newMessage?: Message;
};

export const Chat = ({ selectedUser, newMessage }: Props) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { handleServerErrors } = useAppContext();

  const { data, client } = useQuery(GET_MESSAGES, {
    variables: { otherUserId: selectedUser.id },
    onError: (error) => handleServerErrors(error)
  });

  const messages = data?.getMessages || [];

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  useEffect(() => {
    if (newMessage && !messages.some((message: Message) => message.id === newMessage.id)) {
      const { recipientId, ...relevantMessageFields } = newMessage;
      addNewMessageToChat({ newMessage: relevantMessageFields, client, selectedUserId: selectedUser.id });
      selectedUser.latestMessage = { ...newMessage };
      chatBottomRef.current?.scrollIntoView();
    }
  }, [newMessage]);

  return (
    <div className={cx(chatStyle, containerStyle)}>
      <ChatHeader selectedUser={selectedUser} />
      <Conversation messages={messages} chatBottomRef={chatBottomRef} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

const chatStyle = css`
  display: flex;
  flex-direction: column;
  position: relative;
  background: #f8f9fa;
  border-radius: 10px;
`;
