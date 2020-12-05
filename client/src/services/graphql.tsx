import { gql } from "@apollo/client";

const LOGIN_USER = gql`
mutation LoginUser($username: String! $password: String!) {
  login(username: $username password: $password) {
    id
    username
    image
    token
  }
}
`;

const REGISTER_USER = gql`
mutation RegisterUser($firstName: String! $lastName: String! $username: String! $password: String!) {
  register(firstName: $firstName lastName: $lastName username: $username password: $password) {
    id
    image
    token
  }
}
`;

const GET_All_USERS_EXCEPT_LOGGED = gql`
  query GetAllUsersExceptLogged($loggedInUserId: ID! $limit: String! $offset: String!) {
    getAllUsersExceptLogged(id: $loggedInUserId limit: $limit offset: $offset) {
      users {
        id
        firstName
        lastName
        image
        latestMessage {
          content
          createdAt
        }
      }
      totalUsersCountExceptLoggedUser
    }
  }
`;

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      firstName
      lastName
      image
    }
  }
`;

const GET_MESSAGES = gql`
query GetMessages($otherUserId: ID! $limit: String! $offset: String!) {
  getMessages(otherUserId: $otherUserId limit: $limit offset: $offset) {
    senderId
    content
    createdAt
  }
}
`;

const SEND_MESSAGE = gql`
mutation SendMessage($recipientId: ID! $content: String!) {
  sendMessage(recipientId: $recipientId content: $content) {
    id
  }
}
`;

const NEW_MESSAGE = gql`
  subscription NewMessage {
    newMessage {
      senderId
      recipientId
      content
      createdAt
    }
  }
`;

const getUsersSqlClauses = { limit: 25, offset: 0 };
const geMessagesSqlClauses = { limit: 25, offset: 0 };

const getUsersQueryVariables = (loggedInUserId: string) => {
  return {
    loggedInUserId,
    limit: `${getUsersSqlClauses.limit}`,
    offset: `${getUsersSqlClauses.offset}`
  };
};

const getMessagesQueryVariables = (otherUserId: string) => {
  return {
    otherUserId,
    limit: `${geMessagesSqlClauses.limit}`,
    offset: `${geMessagesSqlClauses.offset}`
  };
};

export {
  LOGIN_USER, REGISTER_USER, GET_All_USERS_EXCEPT_LOGGED, GET_USER, GET_MESSAGES, SEND_MESSAGE,
  NEW_MESSAGE, getUsersSqlClauses, getUsersQueryVariables, getMessagesQueryVariables
};