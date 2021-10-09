import { useEffect, createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { User } from "interfaces/interfaces";
import { HistoryType } from "App";

export type AppContextType = {
  loggedInUser: User | {};
  error: string;
  logout: () => void,
  handleErrors: (error: ApolloError) => void;
  clearError: () => void;
};

interface Props {
  children: ReactNode;
  history?: HistoryType;
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
    history?.push("/login");
  };

  const handleErrors = (error: any) => {
    const isGraphQLErrorsIncludesError = (errorMessage: string) => error.graphQLErrors?.[0]?.message?.includes(errorMessage);
    const isUserInputError = isGraphQLErrorsIncludesError("UserInputError");
    const isSequelizeValidationError = isGraphQLErrorsIncludesError("SequelizeValidationError");
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];

    if (gqlContextErrorMessage) {
      if (gqlContextErrorMessage === "Unauthenticated") {
        logout();
      }

      setError(gqlContextErrorMessage);
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