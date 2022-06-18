import { createContext, useState, ReactNode } from "react";
import { ApolloError } from "@apollo/client";
import { logout } from "services/auth";

type Props = {
  children: ReactNode;
}

export type AppContextType = {
  snackBarError: string;
  setSnackBarError: (error: string) => void;
  handleServerErrors: (error: ApolloError) => void;
  clearSnackBarError: () => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: Props) => {
  const [snackBarError, setSnackBarError] = useState("");

  const handleServerErrors = (error: any) => {
    const gqlContextErrorMessage = error.networkError?.result?.errors[0]?.message?.split("Context creation failed: ")[1];
    setSnackBarError(gqlContextErrorMessage || error.message || "Something went wrong...");

    if (gqlContextErrorMessage === "Unauthenticated") {
      logout();
    }
  };

  const clearSnackBarError = () => setSnackBarError("");

  return (
    <AppContext.Provider value={{ snackBarError, setSnackBarError, handleServerErrors, clearSnackBarError }}>
      {children}
    </AppContext.Provider>
  );
};