import { createContext, useContext } from "react";
import type { ApolloError } from "@apollo/client";

type AppContextType = {
  snackBarError: string;
  setSnackBarError: (error: string) => void;
  handleServerErrors: (error: ApolloError) => void;
  clearSnackBarError: () => void;
};

const getMissingProviderError = () => new Error("AppContext is missing. Wrap your component tree with <AppContextProvider>.");

const DEFAULT_APP_CONTEXT = {
  snackBarError: "",
  setSnackBarError: () => {
    throw getMissingProviderError();
  },
  handleServerErrors: () => {
    throw getMissingProviderError();
  },
  clearSnackBarError: () => {
    throw getMissingProviderError();
  }
} as const satisfies AppContextType;

export const AppContext = createContext<AppContextType>(DEFAULT_APP_CONTEXT);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === DEFAULT_APP_CONTEXT) {
    throw getMissingProviderError();
  }

  return context;
};
