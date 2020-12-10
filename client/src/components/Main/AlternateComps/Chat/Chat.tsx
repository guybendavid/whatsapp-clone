import React, { useEffect, useRef, useContext } from "react";
import { AppContext } from "../../../../contexts/AppContext";
import { User, Message } from "../../../../interfaces/interfaces";
import { useQuery } from "@apollo/client";
import { GET_MESSAGES, getMessagesQueryVariables } from "../../../../services/graphql";
import ChatHeader from "./ChatHeader/ChatHeader";
import Conversation from "./Conversation/Conversation";
import MessageCreator from "./MessageCreator/MessageCreator";
import "./Chat.scss";

interface Props {
  selectedUser: User;
  newMessage: Message;
}

const Chat: React.FC<Props> = ({ selectedUser, newMessage }) => {
  const chatBottomRef = useRef<HTMLHeadingElement>(null);
  const { loggedInUser, handleErrors, clearError } = useContext(AppContext);

  const { data, client, fetchMore: fetchMoreMessages } = useQuery(GET_MESSAGES, {
    variables: getMessagesQueryVariables(selectedUser.id),
    fetchPolicy: "cache-and-network",
    onError: (error) => handleErrors(error),
    onCompleted: () => clearError()
  });

  const conversationData = data?.getMessages;
  const isMoreMessagesToFetch = conversationData?.messages.length < conversationData?.totalMessages;

  useEffect(() => {
    if (data?.getMessages.messages.length > 0) {
      chatBottomRef.current?.scrollIntoView();
    }
  }, [data]);

  // To do: extract to a helper file
  // change updateObj
  // move all main logic to here

  useEffect(() => {
    if (newMessage) {
      const { senderId, recipientId } = newMessage;

      if (senderId === selectedUser.id || (senderId === loggedInUser.id && recipientId === selectedUser.id)) {
        const { getMessages }: any = client.readQuery({
          query: GET_MESSAGES,
          variables: getMessagesQueryVariables(loggedInUser.id)
        });

        const updatedObj = { ...getMessages };
        updatedObj.messages = [...updatedObj.messages, newMessage];
        updatedObj.totalMessages = `${Number(updatedObj.totalMessages) + 1}`;

        client.writeQuery({
          query: GET_MESSAGES,
          variables: getMessagesQueryVariables(loggedInUser.id),
          data: {
            getMessages: updatedObj
          }
        });

        chatBottomRef.current?.scrollIntoView();
      }
    }

    // eslint-disable-next-line
  }, [newMessage]);

  return (
    <div className="chat">
      <ChatHeader selectedUser={selectedUser} newMessage={newMessage} />
      <Conversation messages={data?.getMessages.messages} isMoreMessagesToFetch={isMoreMessagesToFetch}
        chatBottomRef={chatBottomRef}
        fetchMoreMessages={fetchMoreMessages} />
      <MessageCreator selectedUser={selectedUser} />
    </div>
  );
};

export default Chat;