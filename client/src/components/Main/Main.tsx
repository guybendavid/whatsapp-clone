import { useState } from "react";
import { css } from "@emotion/css";
import { getAuthData } from "#root/client/services/auth";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE } from "#root/client/services/graphql";
import { Sidebar } from "#root/client/components/Main/Sidebar/Sidebar";
import { WelcomeScreen } from "#root/client/components/Main/AlternateComps/WelcomeScreen/WelcomeScreen";
import { Chat } from "#root/client/components/Main/AlternateComps/Chat/Chat";
import conversationImage from "#root/client/images/conversation-background.jpg";
import type { SidebarUser, Message } from "#root/client/types/types";

export const Main = () => {
  const [selectedUser, setSelectedUser] = useState<SidebarUser>();
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);
  const newMessage = newMessageData?.newMessage;
  const isNewMessageRelatedToOpenedChat = getIsNewMessageRelatedToOpenedChat(newMessage, selectedUser);

  return (
    <div className={chatStyle}>
      <Sidebar newMessage={newMessage} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      {!selectedUser ? (
        <WelcomeScreen />
      ) : isNewMessageRelatedToOpenedChat ? (
        <Chat selectedUser={selectedUser} newMessage={newMessage} />
      ) : (
        <Chat selectedUser={selectedUser} />
      )}
    </div>
  );
};

const getIsNewMessageRelatedToOpenedChat = (newMessage?: Message, selectedUser?: SidebarUser) => {
  const { loggedInUser } = getAuthData();

  if (!newMessage || !selectedUser) return false;

  const { senderId, recipientId } = newMessage;
  const { id: selectedUserId } = selectedUser;
  return senderId === selectedUserId || (senderId === loggedInUser.id && recipientId === selectedUserId);
};

const chatStyle = css`
  background: url(${conversationImage}); // preloading the conversation image
  display: flex;
  height: 96vh;
  width: 85vw;

  @media only screen and (max-width: 1200px) {
    height: 100vh;
    width: 100vw;
  }

  svg {
    color: var(--dark-gray-color);
    font-size: 1.4rem;
  }
`;
