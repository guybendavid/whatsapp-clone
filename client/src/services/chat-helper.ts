import type { ApolloClient } from "@apollo/client";
import type { ConversationMessage } from "components/Main/AlternateComps/Chat/Conversation/Conversation";
import { GET_MESSAGES } from "./graphql";

export const addNewMessageToChat = ({
  newMessage,
  client,
  selectedUserId
}: {
  newMessage: ConversationMessage;
  client: ApolloClient<object>;
  selectedUserId: string;
}) => {
  const queryToUpdate = { query: GET_MESSAGES, variables: { otherUserId: selectedUserId } };
  const prevData = client.readQuery(queryToUpdate);
  client.writeQuery({ ...queryToUpdate, data: { getMessages: [...(prevData?.getMessages || []), newMessage] } });
};
