import { Route, Redirect, type RouteComponentProps } from "react-router-dom";
import { getAuthData } from "#root/client/services/auth";
import type { FC } from "react";

type Props = {
  exact: boolean;
  path: string;
  Component: FC<RouteComponentProps>;
};

export const UnauthenticatedRoute: FC<Props> = ({ exact, path, Component }) => {
  const { isAuthenticated } = getAuthData();
  return <Route exact={exact} path={path} render={(props) => (!isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)} />;
};
