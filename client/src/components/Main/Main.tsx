import { useState } from "react";
import { getLoggedInUser } from "services/auth";
import { User } from "interfaces/interfaces";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE } from "services/graphql";
import Sidebar from "./Sidebar/Sidebar";
import WelcomeScreen from "./AlternateComps/WelcomeScreen/WelcomeScreen";
import Chat from "./AlternateComps/Chat/Chat";
import "./Main.scss";

const Main = () => {
  const loggedInUser = getLoggedInUser();
  const [selectedUser, setSelectedUser] = useState<User>();
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);
  const newMessage = newMessageData?.newMessage;

  const isNewMessageRelevantToOpenedChat = () => {
    if (newMessage) {
      const { senderId, recipientId } = newMessage;
      const { id: selectedUserId } = selectedUser as User;
      return senderId === selectedUserId || (senderId === loggedInUser?.id && recipientId === selectedUserId);
    }
  };

  return (
    <div className="main">
      <Sidebar setSelectedUser={setSelectedUser} newMessage={newMessage} />
      {selectedUser ? <Chat selectedUser={selectedUser}
        newMessage={isNewMessageRelevantToOpenedChat() && newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;