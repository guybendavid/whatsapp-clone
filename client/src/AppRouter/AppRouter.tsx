import { useEffect } from "react";
import { Container } from "@material-ui/core";
import { Switch, useHistory, useLocation, withRouter, RouteComponentProps } from "react-router-dom";
import { History, LocationState } from "history";
import { classNamesGenerator } from "@guybendavid/utils";
import Main from "components/Main/Main";
import Login from "components/AuthForms/Login";
import Register from "components/AuthForms/Register";
import AuthenticatedRoute from "./Routes/AuthenticatedRoute";
import UnAuthenticatedRoute from "./Routes/UnAuthenticatedRoute";
import DefaultRoute from "./Routes/DefaultRoute";
import ErrorMessage from "components/ErrorMessage/ErrorMessage";

interface Props extends RouteComponentProps {
  setHistory: (history: History<LocationState>) => void;
}

const AppRouter = ({ setHistory }: Props) => {
  const history = useHistory();
  const location = useLocation();
  const isAuthForm = location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    setHistory(history);
    // eslint-disable-next-line
  }, []);

  return (
    <Container className={classNamesGenerator("container", isAuthForm && "is-auth-form")} maxWidth={isAuthForm ? "sm" : "xl"}>
      <Switch>
        <AuthenticatedRoute exact path="/" Component={Main} />
        <UnAuthenticatedRoute exact path="/login" Component={Login} />
        <UnAuthenticatedRoute exact path="/register" Component={Register} />
        <DefaultRoute />
      </Switch>
      <ErrorMessage />
    </Container>
  );
};

export default withRouter(AppRouter);