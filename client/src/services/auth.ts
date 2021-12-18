import { User } from "interfaces/interfaces";
import { History, LocationState } from "history";

function handleAuth(data: User, history: History<LocationState>) {
  const { token, ...user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    history.push("/chat");
    window.location.reload();
  }
}

const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
const isAuthenticated = loggedInUser && localStorage.token;

export { loggedInUser, isAuthenticated, handleAuth };