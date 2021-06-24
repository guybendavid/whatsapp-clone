import { useEffect, createContext, useState, ReactNode } from "react";
import { History, LocationState } from "history";
import { ApolloError } from "@apollo/client";
import { User } from "interfaces/interfaces";

export type AppContextType = {
  loggedInUser: User | {};
  error: string;
  logout: () => void,
  handleErrors: (error: ApolloError) => void;
  clearError: () => void;
};

type HistoryType = History<LocationState>;

interface Props {
  children: ReactNode;
  history: HistoryType | {};
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children, history }: Props) => {
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

  // To do: fix type, use formatError instead all of this mess and check all type of errors behavior
  const handleErrors = (error: any) => {
    const isGraphQLErrorsIncludesError = (errorMessage: string) => error.graphQLErrors?.[0]?.message?.includes(errorMessage);
    const isUserInputError = isGraphQLErrorsIncludesError("UserInputError");
    const isSequelizeValidationError = isGraphQLErrorsIncludesError("SequelizeValidationError");

    if (error.networkError?.result?.errors[0]?.message) {
      const errorMessage = error.networkError.result.errors[0].message.split("Context creation failed: ")[1];

      if (errorMessage === "Unauthenticated") {
        logout();
      }

      setError(errorMessage);
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