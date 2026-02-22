import { logout } from "#root/client/services/auth";
import create from "zustand";
import type { ApolloError } from "@apollo/client";

type AppStore = {
  snackBarError: string;
  setSnackBarError: (snackBarError: string) => void;
  clearSnackBarError: () => void;
  handleServerErrors: (error: ApolloError) => void;
  logout: () => void;
};

type SetFunction = (fn: (state: AppStore) => Partial<AppStore>) => void;

type GetFunction = () => AppStore;

const initialSnackBarError = "";

const getAppStore = (set: SetFunction, get: GetFunction): AppStore => ({
  snackBarError: initialSnackBarError,
  setSnackBarError: (snackBarError) => set(() => ({ snackBarError })),
  clearSnackBarError: () => set(() => ({ snackBarError: initialSnackBarError })),
  handleServerErrors: (error) => {
    const networkErrorWithResult = error.networkError as { result?: { errors?: { message?: string }[] } };
    const gqlContextErrorMessage = networkErrorWithResult?.result?.errors?.[0]?.message?.split("Context creation failed: ").pop();
    const errorMessage = gqlContextErrorMessage || error.message || "Something went wrong...";
    set(() => ({ snackBarError: errorMessage }));

    if (errorMessage === "Unauthenticated") {
      get().logout();
    }
  },
  logout: () => logout()
});

export const useAppStore = create(getAppStore);
