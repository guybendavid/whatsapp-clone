import { FC } from "react";
import { Route, Redirect } from "react-router";
import { RouteComponentProps } from "react-router-dom";

interface Props {
  exact: boolean;
  path: string;
  Component: FC<RouteComponentProps>;
}

const UnAuthenticatedRoute = ({ path, Component }: Props) => {
  return (
    <Route path={path} render={props => !localStorage.token ? <Component {...props} /> : <Redirect to="/" />} />
  );
};

export default UnAuthenticatedRoute;