import { ApolloClient } from "@apollo/client";
import { Message } from "interfaces/interfaces";
import { GET_MESSAGES } from "./graphql";

// To do: check why it is working without this also (apollo provider)
const addNewMessageToChat = (newMessage: Message, client: ApolloClient<any>, selectedUserId: string) => {
  const queryToUpdate = { query: GET_MESSAGES, variables: { otherUserId: selectedUserId } };

  const newData = {
    getMessages: [newMessage]
  };

  client.writeQuery({ ...queryToUpdate, data: { getMessages: newData } });
};

export { addNewMessageToChat };