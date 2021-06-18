import { ComponentType } from "react";
import { Route, Redirect } from "react-router";

interface Props {
  exact: boolean;
  path: string;
  Component: ComponentType<any>;
}

const UnauthenticatedRoute = ({ path, Component }: Props) => {
  return (
    <Route path={path} render={props => !localStorage.loggedInUser ? <Component {...props} /> : <Redirect to="/" />} />
  );
};

export default UnauthenticatedRoute;