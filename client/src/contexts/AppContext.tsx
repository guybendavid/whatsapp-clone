import { createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { logout } from "services/auth";

type AppContextType = {
  error: string;
  handleErrors: (error: ApolloError) => void;
  clearError: () => void;
};

interface Props {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: Props) => {
  const [error, setError] = useState("");

  const handleErrors = (error: any) => {
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];
    setError(gqlContextErrorMessage || error.message || "Something went wrong...");

    if (gqlContextErrorMessage === "Unauthenticated") {
      logout();
    }
  };

  const clearError = () => setError("");

  return (
    <AppContext.Provider value={{ error, handleErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
export type { AppContextType };