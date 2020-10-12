import { User } from "../interfaces/interfaces";

const handleAuth = (data: User, history: any) => {
  const { token, ...user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    history.push("/chat");
    window.location.reload();
  }
};

export { handleAuth };