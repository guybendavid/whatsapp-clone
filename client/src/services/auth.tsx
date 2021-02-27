import { User } from "../interfaces/interfaces";
import { History, LocationState } from "history";

const handleAuth = (data: User, history: History<LocationState>) => {
  const { token, ...user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    history.push("/chat");
    window.location.reload();
  }
};

export { handleAuth };