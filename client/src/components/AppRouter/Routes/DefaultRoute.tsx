import { Route, Redirect } from "react-router-dom";
import { getAuthData } from "#root/client/services/auth";

export const DefaultRoute = () => {
  const { isAuthenticated } = getAuthData();
  return <Route render={() => (isAuthenticated ? <Redirect to="/" /> : <Redirect to="/login" />)} />;
};
