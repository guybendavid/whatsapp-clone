import { FC } from "react";
import { Route, Redirect } from "react-router";
import { getAuthData } from "services/auth";

type Props = {
  exact: boolean;
  path: string;
  isAdminRoute?: boolean;
  Component: FC;
};

export const AuthenticatedRoute = ({ path, Component }: Props) => {
  const { isAuthenticated } = getAuthData();
  return <Route path={path} render={() => (isAuthenticated ? <Component /> : <Redirect to="/login" />)} />;
};
