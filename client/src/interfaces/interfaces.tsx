// To do: questions marks, add id, password
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