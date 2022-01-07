import { createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { isAuthenticated } from "services/auth";

export type AppContextType = {
  error: string;
  logout: () => void,
  handleErrors: (error: ApolloError) => void;
  clearError: () => void;
};

interface Props {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: Props) => {
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleErrors = (error: any) => {
    const isAuthForm = ["/login", "/register"].includes(window.location.pathname);
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
    <AppContext.Provider value={{ error, logout, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };