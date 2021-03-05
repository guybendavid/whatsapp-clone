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
  query GetAllUsersExceptLogged($loggedInUserId: ID! $offset: String! $limit: String!) {
    getAllUsersExceptLogged(id: $loggedInUserId offset: $offset limit: $limit) {
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
      totalUsersExceptLoggedUser
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
query GetMessages($otherUserId: ID!) {
  getMessages(otherUserId: $otherUserId) {
    id
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
      id
      senderId
      recipientId
      content
      createdAt
    }
  }
`;

const getUsersSqlClauses = { offset: 0, limit: 50 };

const getUsersQueryVariables = (loggedInUserId: string) => {
  return {
    loggedInUserId,
    offset: `${getUsersSqlClauses.offset}`,
    limit: `${getUsersSqlClauses.limit}`
  };
};

export {
  LOGIN_USER, REGISTER_USER, GET_All_USERS_EXCEPT_LOGGED, GET_USER, GET_MESSAGES, SEND_MESSAGE,
  NEW_MESSAGE, getUsersSqlClauses, getUsersQueryVariables
};