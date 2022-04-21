import { User } from "interfaces/interfaces";

function handleAuth(data: User) {
  const { token, ...user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    window.location.reload();
  }
}

function getAuthData() {
  const { pathname } = window.location;
  const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
  const isAuthenticated = Boolean(loggedInUser && localStorage.token);
  const isAuthForm = pathname === "/login" || pathname === "/register";
  return { loggedInUser, isAuthenticated, isAuthForm };
}

function logout() {
  localStorage.clear();
  window.location.reload();
};

export { getAuthData, handleAuth, logout };