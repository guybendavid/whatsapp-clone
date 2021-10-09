import { FC } from "react";
import { Route, Redirect } from "react-router";

interface Props {
  exact: boolean;
  path: string;
  isAdminRoute?: boolean;
  Component: FC;
}

const AuthenticatedRoute = ({ path, Component }: Props) => {
  return (
    <Route path={path} render={() => localStorage.token ? <Component /> : <Redirect to="/login" />} />
  );
};

export default AuthenticatedRoute;