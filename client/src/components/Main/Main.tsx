import { useState } from "react";
import { css } from "@emotion/css";
import { getAuthData } from "services/auth";
import { SidebarUser, Message } from "types/types";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE } from "services/graphql";
import { Sidebar } from "./Sidebar/Sidebar";
import { WelcomeScreen } from "./AlternateComps/WelcomeScreen/WelcomeScreen";
import { Chat } from "./AlternateComps/Chat/Chat";
import conversationImage from "images/conversation-background.jpg";

export const Main = () => {
  const [selectedUser, setSelectedUser] = useState<SidebarUser>();
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);
  const newMessage = newMessageData?.newMessage;

  return (
    <div className={style}>
      <Sidebar newMessage={newMessage} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      {selectedUser ? (
        <Chat
          selectedUser={selectedUser}
          newMessage={isNewMessageRelatedToOpenedChat(newMessage, selectedUser) ? newMessage : undefined}
        />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

const isNewMessageRelatedToOpenedChat = (newMessage?: Message, selectedUser?: SidebarUser) => {
  const { loggedInUser } = getAuthData();

  if (newMessage) {
    const { senderId, recipientId } = newMessage;
    const { id: selectedUserId } = selectedUser as SidebarUser;
    return senderId === selectedUserId || (senderId === loggedInUser.id && recipientId === selectedUserId);
  }
};

const style = css`
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
