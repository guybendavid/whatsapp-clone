import { Route, Redirect } from "react-router";
import { getLoggedInUser } from "services/auth";

const DefaultRoute = () => {
  const loggedInUser = getLoggedInUser();

  return (
    <Route render={() => loggedInUser ? <Redirect to="/" /> : <Redirect to="/login" />} />
  );
};

export default DefaultRoute;