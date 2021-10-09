import { FC } from "react";
import { Route, Redirect } from "react-router";
import { getLoggedInUser } from "services/auth";

interface Props {
  exact: boolean;
  path: string;
  isAdminRoute?: boolean;
  Component: FC;
}

const AuthenticatedRoute = ({ path, Component }: Props) => {
  const loggedInUser = getLoggedInUser();

  return (
    <Route path={path} render={() => loggedInUser ? <Component /> : <Redirect to="/login" />} />
  );
};

export default AuthenticatedRoute;