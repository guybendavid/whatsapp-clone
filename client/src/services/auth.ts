import { User } from "types/types";

type AuthOperationResponseUser = Omit<User, "email" | "password">;

type AuthOperationResponse = {
  user: AuthOperationResponseUser;
  token: string;
};

export const handleAuth = (data: AuthOperationResponse) => {
  const { token, user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    window.location.reload();
  }
};

export const getAuthData = () => {
  const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
  const isAuthenticated = Boolean(loggedInUser && localStorage.token);
  return { loggedInUser, isAuthenticated };
};

export const logout = () => {
  localStorage.clear();
  window.location.reload();
};
