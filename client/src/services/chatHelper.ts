import { ApolloClient } from "@apollo/client";
import { Message } from "interfaces/interfaces";
import { GET_MESSAGES } from "./graphql";

const addNewMessageToChat = (newMessage: Message, client: ApolloClient<any>, selectedUserId: string) => {
  const queryToUpdate = { query: GET_MESSAGES, variables: { otherUserId: selectedUserId } };
  const data = client.readQuery(queryToUpdate);
  console.log(data.getMessages);
  client.writeQuery({ ...queryToUpdate, data: { getMessages: [...data.getMessages, newMessage] } });
};

export { addNewMessageToChat };