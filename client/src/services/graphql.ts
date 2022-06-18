import { gql } from "@apollo/client";

const AUTH_FIELDS = gql`
  fragment AuthFields on User {
    id
    image
  }
`;

export const LOGIN_USER = gql`
  ${AUTH_FIELDS}
  mutation LoginUser($username: String! $password: String!) {
    login(username: $username password: $password) {
      user {
        ...AuthFields
        username
      }
      token
    }
  }
`;

export const REGISTER_USER = gql`
  ${AUTH_FIELDS}
  mutation RegisterUser($firstName: String! $lastName: String! $username: String! $password: String!) {
    register(firstName: $firstName lastName: $lastName username: $username password: $password) {
      user {
        ...AuthFields
      }
      token
    }
  }
`;

export const GET_All_USERS_EXCEPT_LOGGED = gql`
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

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      firstName
      lastName
      image
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($otherUserId: ID!) {
    getMessages(otherUserId: $otherUserId) {
      id
      senderId
      content
      createdAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($recipientId: ID! $content: String!) {
    sendMessage(recipientId: $recipientId content: $content) {
      id
    }
  }
`;

export const NEW_MESSAGE = gql`
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

export const getUsersSqlClauses = { offset: 0, limit: 50 };

export function getUsersQueryVariables(loggedInUserId: string) {
  return {
    loggedInUserId,
    offset: `${getUsersSqlClauses.offset}`,
    limit: `${getUsersSqlClauses.limit}`
  };
};