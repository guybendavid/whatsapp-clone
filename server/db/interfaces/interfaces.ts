interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
}

interface Message {
  senderId: string;
  recipientId: string;
  content: string;
}

export { User, Message };