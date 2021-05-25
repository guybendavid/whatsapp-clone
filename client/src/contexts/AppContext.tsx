import { FC, useEffect, createContext, useState, Context, ReactNode } from "react";
import { History, LocationState } from "history";
import { ApolloError } from "@apollo/client";
import { User } from "interfaces/interfaces";

type HistoryType = History<LocationState>;

interface Props {
  children: ReactNode;
  history: HistoryType | {};
}

const AppContext: Context<any> = createContext(undefined);

const AppContextProvider: FC<Props> = ({ children, history }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | {}>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const user = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
    setLoggedInUser(user);
  }, []);

  const logout = () => {
    localStorage.clear();
    (history as HistoryType).push("/login");
  };

  const handleErrors = (error: ApolloError) => {
    const isGraphQLErrorsIncludesError = (errorMessage: string) => {
      return error.graphQLErrors && error.graphQLErrors[0]?.message?.includes(errorMessage);
    };

    const isUserInputError = isGraphQLErrorsIncludesError("UserInputError");
    const isSequelizeValidationError = isGraphQLErrorsIncludesError("SequelizeValidationError");

    if (error.message === "Unauthenticated") {
      logout();
    } else if (isUserInputError || isSequelizeValidationError) {
      setError(error.graphQLErrors[0].message.split(": ")[isUserInputError ? 1 : 2]);
    } else {
      setError(error.message);
    }
  };

  const clearError = () => {
    setError("");
  };

  return (
    <AppContext.Provider value={{ loggedInUser, error, logout, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };