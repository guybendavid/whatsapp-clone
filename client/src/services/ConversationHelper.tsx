import { Message } from "../interfaces/interfaces";
import { GET_MESSAGES, getMessagesQueryVariables } from "./graphql";

const addNewMessageToConversation = (newMessage: Message, selectedUserId: string, loggedInUserId: string, client: any,
  chatBottomRef: any) => {

  const { senderId, recipientId } = newMessage;

  if (senderId === selectedUserId || (senderId === loggedInUserId && recipientId === selectedUserId)) {
    const { getMessages }: any = client.readQuery({
      query: GET_MESSAGES,
      variables: getMessagesQueryVariables(selectedUserId)
    });

    const updatedData = { ...getMessages };
    updatedData.messages = [...updatedData.messages, newMessage];
    updatedData.totalMessages = `${Number(updatedData.totalMessages) + 1}`;

    client.writeQuery({
      query: GET_MESSAGES,
      variables: getMessagesQueryVariables(selectedUserId),
      data: {
        getMessages: updatedData
      }
    });

    // chatBottomRef.current?.scrollIntoView();
  }
};

const messagesIdentifier = (messages: Message[], setFirstIndexesOfSeries: (indexes: any[]) => void) => {
  const lastMessageOfSeries: Message[] = [];
  // eslint-disable-next-line
  const firstOfSeriesIndexes = messages.map((message: Message, index: number) => {

    if (lastMessageOfSeries.length === 0) {
      lastMessageOfSeries.push(message);
      return index;
    } else {
      const lastMessage = lastMessageOfSeries[lastMessageOfSeries.length - 1];

      if (message.senderId !== lastMessage.senderId) {
        lastMessageOfSeries.push(message);
        return index;
      }
    }
  });

  setFirstIndexesOfSeries(firstOfSeriesIndexes);
};

const classesGenerator = (senderId: string, loggedInUserId: string, firstIndexesOfSeries: any[], index: number) => {
  let classes = "message";

  if (senderId === loggedInUserId) {
    classes += " sent-message";
  }

  if (firstIndexesOfSeries.includes(index)) {
    classes += " first-of-series";
  }

  return classes;
};

export { addNewMessageToConversation, messagesIdentifier, classesGenerator };