export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
}

export interface SendMessagePayload {
  senderId: string;
  recipientId: string;
  content: string;
}