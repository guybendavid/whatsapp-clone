import { Route, Redirect } from "react-router";

const DefaultRoute = () => {
  return (
    <Route render={() => localStorage.loggedInUser ? <Redirect to="/" /> : <Redirect to="/login" />} />
  );
};

export default DefaultRoute;