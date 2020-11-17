import React, { useEffect, createContext, useState, Context } from "react";
import { User } from "../interfaces/interfaces";

interface Props {
  children: React.ReactNode;
}

const AppContext: Context<any> = createContext(undefined);

const displayMessageTime = (date?: string) => {
  let time = "";

  const handleEdgeCases = (timePart: string | number) => {
    return timePart = timePart < 10 ? `0${timePart}` : timePart;
  };

  if (date) {
    let hours: string | number = new Date(date).getHours();
    let minutes: string | number = new Date(date).getMinutes();
    hours = handleEdgeCases(hours);
    minutes = handleEdgeCases(minutes);
    time = `${hours}:${minutes}`;
  }

  return time;
};

const AppContextProvider: React.FC<Props> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | {}>({});
  const [error, setError] = useState("");

  const handleAuthErrors = (error: any, history?: any) => {
    if (error.message === "Unauthenticated") {
      localStorage.clear();
      history.push("/login");
    } else {
      error.graphQLErrors[0]?.message.includes("SequelizeValidationError") ?
        setError(error.graphQLErrors[0]?.message?.split(": ")[2]) :
        setError(error.graphQLErrors[0]?.message?.split(": ")[1]);
    }
  };

  const clearError = () => {
    setError("");
  };

  useEffect(() => {
    const user = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
    setLoggedInUser(user);
  }, []);

  return (
    <AppContext.Provider value={{ loggedInUser, displayMessageTime, error, handleAuthErrors, clearError }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };