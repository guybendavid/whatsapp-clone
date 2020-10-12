import React from "react";
import { Route, Redirect } from "react-router";

interface Props {
  exact: boolean;
  path: string;
  Component: React.ComponentType<any>;
}

const UnauthenticatedRoute: React.FC<Props> = ({ path, Component }) => {
  return (
    <Route path={path} render={props => !localStorage.loggedInUser ? <Component {...props} /> : <Redirect to="/" />} />
  );
};

export default UnauthenticatedRoute;