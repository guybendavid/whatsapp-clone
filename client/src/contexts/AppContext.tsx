import { createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { HistoryType } from "App";
import { getLoggedInUser } from "services/auth";

export type AppContextType = {
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
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.clear();
    history?.push("/login");
  };

  const handleErrors = (error: any) => {
    const loggedInUser = getLoggedInUser();
    const isAuthForm = window.location.pathname === "/login" || window.location.pathname === "/register";
    const isGraphQLErrorsIncludesError = (errorMessage: string) => error.graphQLErrors?.[0]?.message?.includes(errorMessage);
    const isUserInputError = isGraphQLErrorsIncludesError("UserInputError");
    const isSequelizeValidationError = isGraphQLErrorsIncludesError("SequelizeValidationError");
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];

    if (gqlContextErrorMessage === "Unauthenticated" || (!loggedInUser && !isAuthForm)) {
      logout();
      setError(gqlContextErrorMessage || "Unauthenticated");
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
    <AppContext.Provider value={{ error, logout, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };