import { useEffect, useRef, useContext } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { User, Message } from "interfaces/interfaces";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "services/graphql";
import { addNewMessageToChat } from "services/chatHelper";
import ChatHeader from "./ChatHeader/ChatHeader";
import Conversation from "./Conversation/Conversation";
import MessageCreator from "./MessageCreator/MessageCreator";
import "./Chat.scss";

interface Props {
  selectedUser: User;
  newMessage: Message;
}

const Chat = ({ selectedUser, newMessage }: Props) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { handleErrors } = useContext(AppContext) as AppContextType;

  const { data, client } = useQuery(GET_MESSAGES, {
    variables: { otherUserId: selectedUser.id },
    onError: (error) => handleErrors(error)
  });

  const messages = data?.getMessages;

  useEffect(() => {
    if (messages && messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    if (newMessage) {
      const { recipientId, ...messageToAdd } = newMessage;
      addNewMessageToChat(messageToAdd, client, selectedUser.id);
      selectedUser.latestMessage = { ...newMessage };
      chatBottomRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line
  }, [newMessage]);

  return (
    <div className="chat">
      <ChatHeader selectedUser={selectedUser} />
      <Conversation messages={messages} chatBottomRef={chatBottomRef} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;