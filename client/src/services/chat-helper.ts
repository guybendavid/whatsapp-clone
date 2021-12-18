import { ApolloClient } from "@apollo/client";
import { Message } from "interfaces/interfaces";
import { GET_MESSAGES } from "./graphql";

function addNewMessageToChat(newMessage: Message, client: ApolloClient<any>, selectedUserId: string) {
  const queryToUpdate = { query: GET_MESSAGES, variables: { otherUserId: selectedUserId } };
  const prevData = client.readQuery(queryToUpdate);
  client.writeQuery({ ...queryToUpdate, data: { getMessages: [...prevData?.getMessages || [], newMessage] } });
};

export { addNewMessageToChat };