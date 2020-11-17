import { gql } from "apollo-server";

export = gql`
  type SideBarUsers {
    users: [User]!
    totalUsersCountExceptLoggedUser: String!
  }
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    username: String!
    image: String
    latestMessage: Message
    token: String
  }
  type Message {
    id: ID!
    senderId: String!
    recipientId: String!
    content: String
    createdAt: String
  }
  type Query {
    getAllUsersExceptLogged(id: ID! offset: String! limit: String!): SideBarUsers!
    getUser(id: ID!): User!
    getMessages(otherUserId: ID!): [Message]!
  }
  type Mutation {
    login(username: String! password: String!): User!
    register(firstName: String! lastName: String! username: String! password: String!): User!
    sendMessage(recipientId: ID! content: String!): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`;