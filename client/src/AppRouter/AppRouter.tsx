import { Container } from "@material-ui/core";
import { Switch, withRouter } from "react-router-dom";
import { classNamesGenerator } from "@guybendavid/utils";
import { getAuthData } from "services/auth";
import Main from "components/Main/Main";
import Login from "components/AuthForms/Login";
import Register from "components/AuthForms/Register";
import AuthenticatedRoute from "./Routes/AuthenticatedRoute";
import UnauthenticatedRoute from "./Routes/UnauthenticatedRoute";
import DefaultRoute from "./Routes/DefaultRoute";
import ErrorMessage from "components/ErrorMessage/ErrorMessage";

const AppRouter = () => {
  const { isAuthForm } = getAuthData();

  return (
    <Container className={classNamesGenerator("container", isAuthForm && "is-auth-form")} maxWidth={isAuthForm ? "sm" : "xl"}>
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