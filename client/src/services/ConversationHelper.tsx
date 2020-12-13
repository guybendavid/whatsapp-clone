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

// To do: fix the another fetch request when a new message is sent and maybe the delay will be removed also
// Then try to move the merge logic of the conversation to apolloProvider
// consider set the fetchPolicy of the sidebar users to cache-and-network
// may be attache onCompleted and onError to all apollo methods
// disable the fetchMoreUsers, and check what happens when a new user is added after users is retrieved from cache

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