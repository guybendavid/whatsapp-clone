import React, { useEffect, useRef, useContext } from "react";
import { AppContext } from "../../../../contexts/AppContext";
import { User, Message } from "../../../../interfaces/interfaces";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES } from "../../../../services/graphql";
import { addNewMessageToConversation } from "../../../../services/ConversationHelper";
import ChatHeader from "./ChatHeader/ChatHeader";
import Conversation from "./Conversation/Conversation";
import MessageCreator from "./MessageCreator/MessageCreator";
import "./Chat.scss";

interface Props {
  selectedUser: User;
  newMessage?: Message;
}

const Chat: React.FC<Props> = ({ selectedUser, newMessage }) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { loggedInUser, handleErrors, clearError } = useContext(AppContext);

  const { data, client } = useQuery(GET_MESSAGES, {
    variables: { otherUserId: selectedUser.id },
    fetchPolicy: "cache-and-network",
    onError: (error) => handleErrors(error),
    onCompleted: () => clearError()
  });

  useEffect(() => {
    if (data?.getMessages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
    // eslint-disable-next-line
  }, [data]);

  useEffect(() => {
    if (newMessage) {
      addNewMessageToConversation(newMessage, selectedUser.id, loggedInUser.id, client, chatBottomRef);
    }
    // eslint-disable-next-line
  }, [newMessage]);

  return (
    <div className="chat">
      <ChatHeader selectedUser={selectedUser} newMessage={newMessage} />
      <Conversation messages={data?.getMessages} chatBottomRef={chatBottomRef} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;