import { Message } from "../interfaces/interfaces";
import { GET_MESSAGES } from "./graphql";

const addNewMessageToConversation = (newMessage: Message, isPrevMessages: boolean, selectedUserId: string, loggedInUserId: string,
  client: any, chatBottomRef: any) => {

  const { senderId, recipientId } = newMessage;

  if (senderId === selectedUserId || (senderId === loggedInUserId && recipientId === selectedUserId)) {
    let prevMessages: Message[] = [];

    if (isPrevMessages) {
      const { getMessages }: any = client.readQuery({
        query: GET_MESSAGES,
        variables: { otherUserId: selectedUserId }
      });

      prevMessages = [...getMessages];
    }

    client.writeQuery({
      query: GET_MESSAGES,
      variables: { otherUser: selectedUserId },
      data: {
        getMessages: [...prevMessages, newMessage]
      }
    });

    chatBottomRef.current?.scrollIntoView();
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

// To do: fix delay
// fix the another fetch request when a new message is sent
// explore the cache system and find out how the paginated users are retrived from the cache after they are been saved there

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