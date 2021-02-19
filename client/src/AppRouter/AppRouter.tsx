import React from "react";
import { Container } from "@material-ui/core";
import { Switch, useLocation, withRouter } from "react-router-dom";
import Main from "../components/Main/Main";
import Login from "../components/Forms/Login";
import Register from "../components/Forms/Register";
import AuthenticatedRoute from "./Routes/AuthenticatedRoute";
import UnauthenticatedRoute from "./Routes/UnauthenticatedRoute";
import DefaultRoute from "./Routes/DefaultRoute";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";

const AppRouter = () => {
  const location = useLocation();
  const isAuthForm = location.pathname === "/login" || location.pathname === "/register";

  return (
    <Container className={"container " + (isAuthForm && "is-auth-form")} maxWidth={isAuthForm ? "sm" : "xl"} >
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