import React, { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../../../contexts/AppContext";
import { User, Message } from "../../../interfaces/interfaces";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES, getMessagesQueryVariables } from "../../../services/graphql";
import TopSection from "./Sections/TopSection";
import MiddleSection from "./Sections/MiddleSection";
import BottomSection from "./Sections/BottomSection";
import "./Chat.scss";

interface Props {
  selectedUser: User;
  newMessage: Message;
}

const Chat: React.FC<Props> = ({ selectedUser, newMessage }) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { loggedInUser, handleErrors, clearError } = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([]);

  const { data } = useQuery(GET_MESSAGES, {
    variables: getMessagesQueryVariables(selectedUser.id),
    fetchPolicy: "cache-and-network",
    onError: (error) => handleErrors(error),
    onCompleted: () => clearError()
  });

  useEffect(() => {
    if (data?.getMessages) {
      setMessages(data.getMessages);
    }
  }, [data]);

  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  useEffect(() => {
    if (newMessage) {
      const { senderId, recipientId } = newMessage;

      if (senderId === selectedUser.id || (senderId === loggedInUser.id && recipientId === selectedUser.id)) {
        setMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }

    // eslint-disable-next-line
  }, [newMessage]);

  return (
    <div className="chat">
      <TopSection selectedUser={selectedUser} newMessage={newMessage} />
      <MiddleSection messages={messages} chatBottomRef={chatBottomRef} />
      <BottomSection selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;