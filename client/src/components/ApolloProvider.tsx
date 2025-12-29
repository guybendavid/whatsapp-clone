import type { ApolloLink } from "@apollo/client";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { App } from "App";

const { NODE_ENV, REACT_APP_BASE_URL } = process.env;
const isProduction = NODE_ENV === "production";
const baseHttpLink: ApolloLink = new HttpLink({ uri: isProduction ? "" : `http://${REACT_APP_BASE_URL}` });

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...(localStorage.getItem("token") ? { authorization: `Bearer ${localStorage.getItem("token")}` } : {})
  }
}));

const httpLink = authLink.concat(baseHttpLink);

const wsLink = new WebSocketLink({
  uri: isProduction ? `wss://${window.location.host}` : `ws://${REACT_APP_BASE_URL}`,
  options: {
    reconnect: true,
    connectionParams: {
      ...(localStorage.getItem("token") ? { authorization: `Bearer ${localStorage.getItem("token")}` } : {})
    }
  }
});

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

export const ApolloProviderWrapper = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
