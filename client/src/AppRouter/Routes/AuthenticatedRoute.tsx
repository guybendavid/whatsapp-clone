import { ComponentType } from "react";
import { Route, Redirect } from "react-router";

interface Props {
  exact: boolean;
  path: string;
  isAdminRoute?: boolean;
  Component: ComponentType;
}

const AuthenticatedRoute = ({ path, Component }: Props) => {
  const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);

  return (
    <Route path={path} render={() => loggedInUser ? <Component /> : <Redirect to="/login" />} />
  );
};

export default AuthenticatedRoute;