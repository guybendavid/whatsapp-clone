import { FC, useEffect, useRef, useContext } from "react";
import { AppContext } from "contexts/AppContext";
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

const Chat: FC<Props> = ({ selectedUser, newMessage }) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { loggedInUser, handleErrors } = useContext(AppContext);

  const { data, client } = useQuery(GET_MESSAGES, {
    variables: { otherUserId: selectedUser.id },
    fetchPolicy: "cache-and-network",
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
      const { senderId, recipientId } = newMessage;

      if (senderId === selectedUser.id || (senderId === loggedInUser.id && recipientId === selectedUser.id)) {
        addNewMessageToChat(newMessage, client, selectedUser.id);
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