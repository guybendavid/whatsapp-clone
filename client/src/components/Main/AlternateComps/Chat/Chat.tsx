import { FC, useEffect, useRef, useContext, useState } from "react";
import { AppContext } from "contexts/AppContext";
import { User, Message } from "interfaces/interfaces";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "services/graphql";
import ChatHeader from "./ChatHeader/ChatHeader";
import Conversation from "./Conversation/Conversation";
import MessageCreator from "./MessageCreator/MessageCreator";
import "./Chat.scss";

interface Props {
  selectedUser: User;
  newMessage: Message;
}

const Chat: FC<Props> = ({ selectedUser, newMessage }) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { loggedInUser, handleErrors } = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([]);

  useQuery(GET_MESSAGES, {
    variables: { otherUserId: selectedUser.id },
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => setMessages(data.getMessages),
    onError: (error) => handleErrors(error)
  });

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    if (newMessage) {
      const { senderId, recipientId } = newMessage;

      if (senderId === selectedUser.id || (senderId === loggedInUser.id && recipientId === selectedUser.id)) {
        setMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);
        chatBottomRef.current?.scrollIntoView();
      }
    }
    // eslint-disable-next-line
  }, [newMessage]);

  return (
    <div className="chat">
      <ChatHeader selectedUser={selectedUser} newMessage={newMessage} />
      <Conversation messages={messages} chatBottomRef={chatBottomRef} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;