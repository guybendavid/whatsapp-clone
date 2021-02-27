import React, { FC, useEffect, createContext, useState, Context, ReactNode } from "react";
import { History, LocationState } from "history";
import { ApolloError } from "@apollo/client";
import { User } from "../interfaces/interfaces";

interface Props {
  children: ReactNode;
}

const AppContext: Context<any> = createContext(undefined);

const AppContextProvider: FC<Props> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | {}>({});
  const [error, setError] = useState("");

  const handleErrors = (error: ApolloError, history?: History<LocationState>) => {
    const isGraphQLErrorsIncludesError = (errorMessage: string) => {
      return error.graphQLErrors && error.graphQLErrors[0]?.message?.includes(errorMessage);
    };

    if (error.message === "Unauthenticated") {
      localStorage.clear();
      history?.push("/login");
    } else if (isGraphQLErrorsIncludesError("UserInputError")) {
      setError(error.graphQLErrors[0].message.split(": ")[1]);
    } else if (isGraphQLErrorsIncludesError("SequelizeValidationError")) {
      setError(error.graphQLErrors[0].message.split(": ")[2]);
    } else {
      setError(error.message);
    }
  };

  const clearError = () => {
    setError("");
  };

  useEffect(() => {
    const user = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
    setLoggedInUser(user);
  }, []);

  return (
    <AppContext.Provider value={{ loggedInUser, error, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };