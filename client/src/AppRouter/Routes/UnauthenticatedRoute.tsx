import { FC } from "react";
import { Route, Redirect } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { getLoggedInUser } from "services/auth";

interface Props {
  exact: boolean;
  path: string;
  Component: FC<RouteComponentProps>;
}

const UnauthenticatedRoute = ({ path, Component }: Props) => {
  const loggedInUser = getLoggedInUser();

  return (
    <Route path={path} render={props => !loggedInUser ? <Component {...props} /> : <Redirect to="/" />} />
  );
};

export default UnauthenticatedRoute;