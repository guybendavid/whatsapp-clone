import { ApolloClient, ApolloError, InMemoryCache, ApolloProvider, HttpLink, split, type ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { useMemo } from "react";
import { App } from "#root/client/App";
import { useAppStore } from "#root/client/stores/app-store";

const isProduction = import.meta.env.MODE === "production";
const baseUrl = import.meta.env.VITE_BASE_URL || "localhost:4000";
const httpUri = isProduction ? `${window.location.origin}/graphql` : `http://${baseUrl}`;

const getWsUri = (uri: string) => {
  const url = new URL(uri);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
};

const wsUri = getWsUri(httpUri);

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

export const ApolloProviderWrapper = () => {
  const handleServerErrors = useAppStore((state) => state.handleServerErrors);

  const client = useMemo(() => {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (!graphQLErrors && !networkError) return;

      handleServerErrors(
        new ApolloError({
          graphQLErrors: graphQLErrors || [],
          networkError
        })
      );
    });

    return new ApolloClient({
      link: errorLink.concat(splitLink),
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
  }, [handleServerErrors]);

  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};
