import { FC } from "react";
import { Route, Redirect } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { getAuthData } from "services/auth";

interface Props {
  exact: boolean;
  path: string;
  Component: FC<RouteComponentProps>;
}

const UnAuthenticatedRoute = ({ path, Component }: Props) => {
  const { isAuthenticated } = getAuthData();

  return (
    <Route path={path} render={props => !isAuthenticated ? <Component {...props} /> : <Redirect to="/" />} />
  );
};

export default UnAuthenticatedRoute;