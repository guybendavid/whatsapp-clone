import { Route, Redirect } from "react-router";
import { getAuthData } from "services/auth";

const DefaultRoute = () => {
  const { isAuthenticated } = getAuthData();
  return <Route render={() => isAuthenticated ? <Redirect to="/" /> : <Redirect to="/login" />} />;
};

export default DefaultRoute;