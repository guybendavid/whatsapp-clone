import { Container } from "@material-ui/core";
import { Switch, withRouter } from "react-router-dom";
import { css } from "@emotion/css";
import { getAuthData } from "services/auth";
import Main from "components/Main/Main";
import Login from "components/AuthForms/Login";
import Register from "components/AuthForms/Register";
import AuthenticatedRoute from "./Routes/AuthenticatedRoute";
import UnauthenticatedRoute from "./Routes/UnauthenticatedRoute";
import DefaultRoute from "./Routes/DefaultRoute";
import ErrorMessage from "components/ErrorMessage/ErrorMessage";

const AppRouter = () => {
  const { isAuthenticated } = getAuthData();

  return (
    <Container className={getContainerStyle(isAuthenticated)} maxWidth={isAuthenticated ? "xl" : "sm"}>
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

const getContainerStyle = (isAuthenticated: boolean) => css`
  ${isAuthenticated ? "align-items: center" : "margin-top: 160px"};
  padding: 0 !important;
  display: flex !important;
  justify-content: center;
  height: 100vh;

  &::before {
    content: "";
    background: var(--green-color);
    position: absolute;
    top: 0;
    left: 0;
    height: 124px;
    width: 100vw;
    z-index: -1;
  }
`;