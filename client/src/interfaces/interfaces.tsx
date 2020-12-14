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
  id: string;
  senderId: string;
  recipientId?: string;
  content: string;
  createdAt: string;
}

interface SidebarProps {
  users: User[];
  isMoreUsersToFetch: boolean;
  fetchMoreUsers: (object: any) => void;
  setSelectedUser: (user: User) => void;
}

export type { User, Message, SidebarProps };