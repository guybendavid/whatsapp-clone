import { User } from "interfaces/interfaces";

function handleAuth(data: User) {
  const { token, ...user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    window.location.reload();
  }
}

const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
const isAuthenticated = loggedInUser && localStorage.token;

export { loggedInUser, isAuthenticated, handleAuth };