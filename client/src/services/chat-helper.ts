import { ApolloClient } from "@apollo/client";
import { ConversationMessage } from "components/Main/AlternateComps/Chat/Conversation/Conversation";
import { GET_MESSAGES } from "./graphql";

export function addNewMessageToChat(newMessage: ConversationMessage, client: ApolloClient<any>, selectedUserId: string) {
  const queryToUpdate = { query: GET_MESSAGES, variables: { otherUserId: selectedUserId } };
  const prevData = client.readQuery(queryToUpdate);
  client.writeQuery({ ...queryToUpdate, data: { getMessages: [...(prevData?.getMessages || []), newMessage] } });
}
