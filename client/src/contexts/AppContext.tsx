import { createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { getAuthData, logout } from "services/auth";

export type AppContextType = {
  error: string;
  handleErrors: (error: ApolloError) => void;
  clearError: () => void;
};

interface Props {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: Props) => {
  const { isAuthenticated, isAuthForm } = getAuthData();
  const [error, setError] = useState("");

  const handleErrors = (error: any) => {
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];

    if (gqlContextErrorMessage === "Unauthenticated" || (!isAuthenticated && !isAuthForm)) {
      logout();
      setError("Unauthenticated");
    } else if (gqlContextErrorMessage) {
      setError(gqlContextErrorMessage);
    } else {
      setError(error.message);
    }
  };

  const clearError = () => {
    setError("");
  };

  return (
    <AppContext.Provider value={{ error, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };