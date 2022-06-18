import { useState } from "react";
import { getAuthData } from "services/auth";
import { SidebarUser, Message } from "types/types";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE } from "services/graphql";
import Sidebar from "./Sidebar/Sidebar";
import WelcomeScreen from "./AlternateComps/WelcomeScreen/WelcomeScreen";
import Chat from "./AlternateComps/Chat/Chat";
import "./Main.scss";

const Main = () => {
  const [selectedUser, setSelectedUser] = useState<SidebarUser>();
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);
  const newMessage = newMessageData?.newMessage;

  return (
    <div className="main">
      <Sidebar newMessage={newMessage} selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      {selectedUser ? <Chat selectedUser={selectedUser}
        newMessage={isNewMessageRelatedToOpenedChat(newMessage, selectedUser) ? newMessage : undefined} /> : <WelcomeScreen />}
    </div>
  );
};

function isNewMessageRelatedToOpenedChat(newMessage?: Message, selectedUser?: SidebarUser) {
  const { loggedInUser } = getAuthData();

  if (newMessage) {
    const { senderId, recipientId } = newMessage;
    const { id: selectedUserId } = selectedUser as SidebarUser;
    return senderId === selectedUserId || (senderId === loggedInUser.id && recipientId === selectedUserId);
  }
};

export default Main;