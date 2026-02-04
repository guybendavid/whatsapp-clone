import { Route, Redirect } from "react-router-dom";
import { getAuthData } from "#root/client/services/auth";
import type { FC } from "react";

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
