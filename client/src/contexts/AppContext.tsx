import type { ReactNode } from "react";
import { useState } from "react";
import type { ApolloError } from "@apollo/client";
import { logout } from "services/auth";
import { AppContext } from "./app-context";

type Props = {
  children: ReactNode;
};

export const AppContextProvider = ({ children }: Props) => {
  const [snackBarError, setSnackBarError] = useState("");

  const handleServerErrors = (error: ApolloError) => {
    const networkError = error.networkError as { result?: { errors?: { message?: string }[] } };
    const gqlContextErrorMessage = networkError?.result?.errors?.[0]?.message?.split("Context creation failed: ").pop();
    setSnackBarError(gqlContextErrorMessage || error.message || "Something went wrong...");

    if (gqlContextErrorMessage === "Unauthenticated") {
      logout();
    }
  };

  const clearSnackBarError = () => setSnackBarError("");

  return (
    <AppContext.Provider value={{ snackBarError, setSnackBarError, clearSnackBarError, handleServerErrors }}>
      {children}
    </AppContext.Provider>
  );
};
