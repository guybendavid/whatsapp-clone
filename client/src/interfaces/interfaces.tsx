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

interface SideBarData {
  users: User[];
  totalUsersCount: number;
}

interface Message {
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export type { User, SideBarData, Message };