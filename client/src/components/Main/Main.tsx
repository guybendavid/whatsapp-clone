import { useState, useContext } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { User } from "interfaces/interfaces";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE } from "services/graphql";
import Sidebar from "./Sidebar/Sidebar";
import WelcomeScreen from "./AlternateComps/WelcomeScreen/WelcomeScreen";
import Chat from "./AlternateComps/Chat/Chat";
import "./Main.scss";

const Main = () => {
  const { loggedInUser } = useContext(AppContext) as AppContextType;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);
  const newMessage = newMessageData?.newMessage;

  const isNewMessageRelevantToOpenedChat = () => {
    if (newMessage) {
      const { senderId, recipientId } = newMessage;

      return (
        senderId === (selectedUser as User).id ||
        (senderId === (loggedInUser as User).id && recipientId === (selectedUser as User).id)
      );
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