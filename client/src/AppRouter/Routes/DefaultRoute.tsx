import { Route, Redirect } from "react-router";

const DefaultRoute = () => {
  return (
    <Route render={() => localStorage.token ? <Redirect to="/" /> : <Redirect to="/login" />} />
  );
};

export default DefaultRoute;