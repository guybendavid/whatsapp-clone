import { Message } from "../interfaces/interfaces";

const messagesIdentifier = (messages: Message[], setFirstIndexesOfSeries: (indexes: any[]) => void) => {
  const lastMessagesOfSeries: Message[] = [];
  // eslint-disable-next-line
  const indexes = messages.map((message: Message, index: number) => {
    if (lastMessagesOfSeries.length === 0) {
      lastMessagesOfSeries.push(message);
      return index;
    } else {
      const lastMessage = lastMessagesOfSeries[lastMessagesOfSeries.length - 1];

      if (message.senderId !== lastMessage.senderId) {
        lastMessagesOfSeries.push(message);
        return index;
      }
    }
  });

  setFirstIndexesOfSeries(indexes);
};

// To do: fix the delay
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