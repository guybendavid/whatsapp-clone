import { Message } from "../interfaces/interfaces";

const messagesIdentifier = (messages: Message[], setFirstIndexesOfSeries: (indexes: any[]) => void) => {
  const lastMessageOfSeries: Message[] = [];
  // eslint-disable-next-line
  const indexes = messages.map((message: Message, index: number) => {

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

  setFirstIndexesOfSeries(indexes);
};

// To do: fix the another fetch request when a new message is sent and maybe the delay will be removed also
// Then try to move the merge logic of the conversation to apolloProvider
// may be attach onCompleted and onError to all apollo methods

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

export { messagesIdentifier, classesGenerator };