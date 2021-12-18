import { createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { HistoryType } from "App";
import { isAuthenticated } from "services/auth";

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
    const isAuthForm = ["/login", "register"].includes(window.location.pathname);
    const isGQLErrorExists = (gqlErrorMessage: string) => error.graphQLErrors?.[0]?.message?.includes(gqlErrorMessage);
    const isUserInputError = isGQLErrorExists("UserInputError");
    const isSequelizeValidationError = isGQLErrorExists("SequelizeValidationError");
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];

    if (gqlContextErrorMessage === "Unauthenticated" || (!isAuthenticated && !isAuthForm)) {
      logout();
      setError("Unauthenticated");
    } else if (gqlContextErrorMessage) {
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
    <AppContext.Provider value={{ error, logout, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };