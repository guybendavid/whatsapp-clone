import React from "react";
import { Container } from "@material-ui/core";
import { Switch, useLocation, withRouter } from "react-router-dom";
import Login from "../components/Forms/Login";
import Register from "../components/Forms/Register";
import AuthenticatedRoute from "./Routes/AuthenticatedRoute";
import UnauthenticatedRoute from "./Routes/UnauthenticatedRoute";
import DefaultRoute from "./Routes/DefaultRoute";
import Main from "../components/Main/Main";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";

const AppRouter: React.FC = () => {
  const location = useLocation();
  const isAuthForm = location.pathname === "/login" || location.pathname === "/register";

  const styles = () => {
    return isAuthForm ? { marginTop: "160px" } : { alignItems: "center" };
  };

  return (
    <Container className="container" maxWidth={isAuthForm ? "sm" : "xl"} style={styles()} >
      <Switch>
        <AuthenticatedRoute exact path="/" Component={Main} />
        <UnauthenticatedRoute exact path="/login" Component={Login} />
        <UnauthenticatedRoute exact path="/register" Component={Register} />
        <DefaultRoute />
      </Switch>
      <ErrorMessage />
    </Container>
  );
};

export default withRouter(AppRouter);