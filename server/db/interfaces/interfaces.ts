interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
}

interface SendMessagePayload {
  senderId: string;
  recipientId: string;
  content: string;
}

export { User, SendMessagePayload };