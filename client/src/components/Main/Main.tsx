import React, { useState } from "react";
import { User } from "../../interfaces/interfaces";
import { useSubscription } from "@apollo/client";
import { NEW_MESSAGE } from "../../services/graphql";
import Sidebar from "./Sidebar/Sidebar";
import WelcomeScreen from "./AlternateComps/WelcomeScreen/WelcomeScreen";
import Chat from "./AlternateComps/Chat/Chat";
import "./Main.scss";

const Main = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: newMessageData } = useSubscription(NEW_MESSAGE);

  return (
    <div className="main">
      <Sidebar setSelectedUser={setSelectedUser} newMessage={newMessageData?.newMessage} />
      {selectedUser ? <Chat selectedUser={selectedUser} newMessage={newMessageData?.newMessage} /> : <WelcomeScreen />}
    </div>
  );
};

export default Main;