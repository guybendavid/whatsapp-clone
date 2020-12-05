import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import App from "./App";

const isProduction = process.env.NODE_ENV === "production";

let httpLink: any = new HttpLink({
  uri: isProduction ?
    `https://${process.env.REACT_APP_BASE_URL_PRODUCTION}` :
    `http://${process.env.REACT_APP_BASE_URL}`
});

const authLink = setContext((_, { headers }: any) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  };
});

httpLink = authLink.concat(httpLink);

const wsLink = new WebSocketLink({
  uri: isProduction ?
    `wss://${process.env.REACT_APP_BASE_URL_PRODUCTION}` :
    `ws://${process.env.REACT_APP_BASE_URL}/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

// To do: finish chat pagination

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getAllUsersExceptLogged: {
          keyArgs: false,
          merge: (prevResult, incomingResult = {}) => {
            const newObj = { ...incomingResult };

            if (prevResult && incomingResult) {
              const { totalUsersCountExceptLoggedUser: prevTotalUsersCount, users: prevUsers } = prevResult;
              const { totalUsersCountExceptLoggedUser: incomingTotalUsersCount, users: incomingUsers } = incomingResult;
              const newRegisteredUsersAddedAlready = incomingTotalUsersCount > prevTotalUsersCount;

              if (incomingUsers.length > 0 && !newRegisteredUsersAddedAlready) {
                newObj.users = [...prevUsers, ...incomingUsers];
              }
            }

            return newObj;
          }
        }
      }
    }
  }
});

const client = new ApolloClient({
  link: splitLink,
  cache
});

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);