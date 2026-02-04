import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split, type ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { App } from "#root/client/App";

const isProduction = import.meta.env.MODE === "production";
const baseUrl = import.meta.env.VITE_BASE_URL || "localhost:4000";
const httpUri = isProduction ? `${window.location.origin}/graphql` : `http://${baseUrl}`;

const wsUri = (() => {
  const url = new URL(httpUri);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
})();

const baseHttpLink: ApolloLink = new HttpLink({
  uri: httpUri
});

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...(localStorage.getItem("token") ? { authorization: `Bearer ${localStorage.getItem("token")}` } : {})
  }
}));

const httpLink = authLink.concat(baseHttpLink);

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUri,
    lazy: false,
    connectionParams: () => ({
      ...(localStorage.getItem("token") ? { authorization: `Bearer ${localStorage.getItem("token")}` } : {})
    })
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

type JsonPrimitive = string | number | boolean;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type UsersMergeResult = JsonObject & { users: JsonValue[] };

const getMergedUsers = (prevResult: UsersMergeResult = { users: [] }, incomingResult: UsersMergeResult): UsersMergeResult => ({
  ...incomingResult,
  users: [...prevResult.users, ...incomingResult.users]
});

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getAllUsersExceptLogged: {
            keyArgs: false,
            merge: getMergedUsers
          }
        }
      }
    }
  })
});

export const ApolloProviderWrapper = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
