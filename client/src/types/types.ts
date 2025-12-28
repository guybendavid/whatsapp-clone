type LatestMessage = {
  content: string;
  createdAt: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  image: string;
};

export interface SidebarUser extends Omit<User, "username" | "password"> {
  latestMessage?: LatestMessage;
}

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
};
