export interface User {
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

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  content: string;
  createdAt: string;
}