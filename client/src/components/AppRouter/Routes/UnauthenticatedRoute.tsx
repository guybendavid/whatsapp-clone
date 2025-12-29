import type { FC } from "react";
import { Route, Redirect } from "react-router-dom";
import type { RouteComponentProps } from "react-router";
import { getAuthData } from "services/auth";

type Props = {
  exact: boolean;
  path: string;
  Component: FC<RouteComponentProps>;
};

export const UnauthenticatedRoute: FC<Props> = ({ exact, path, Component }) => {
  const { isAuthenticated } = getAuthData();
  return <Route exact={exact} path={path} render={(props) => (!isAuthenticated ? <Component {...props} /> : <Redirect to="/" />)} />;
};
