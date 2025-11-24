import { createContext } from "react";
import { ApolloError } from "@apollo/client";

export type AppContextType = {
  snackBarError: string;
  setSnackBarError: (error: string) => void;
  handleServerErrors: (error: ApolloError) => void;
  clearSnackBarError: () => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);
