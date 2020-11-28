// To do: organize both files => this and the server file
interface User {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
  token?: string;
  latestMessage?: {
    content: string;
    createdAt: string;
  };
}

interface Message {
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export type { User, Message };