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
  const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
  const isAuthenticated = Boolean(loggedInUser && localStorage.token);
  const isAuthForm = ["/login", "/register"].includes(window.location.pathname);
  return { loggedInUser, isAuthenticated, isAuthForm };
}

function logout() {
  localStorage.clear();
  window.location.reload();
};

export { getAuthData, handleAuth, logout };