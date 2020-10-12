import React from "react";
import { Route, Redirect } from "react-router";

interface Props {
  exact?: boolean;
  path?: string;
}

const DefaultRoute: React.FC<Props> = () => {
  return (
    <Route render={() => localStorage.loggedInUser ? <Redirect to="/" /> : <Redirect to="/login" />} />
  );
};

export default DefaultRoute;