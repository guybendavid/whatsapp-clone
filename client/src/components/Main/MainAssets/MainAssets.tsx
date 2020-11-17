import { gql } from "@apollo/client";

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

const sqlClauses = { offset: 0, limit: 50 };

const variables = (loggedInUserId: string) => {
  return {
    loggedInUserId,
    offset: `${sqlClauses.offset}`,
    limit: `${sqlClauses.limit}`
  };
};

export { GET_All_USERS_EXCEPT_LOGGED, GET_USER, NEW_MESSAGE, sqlClauses, variables };