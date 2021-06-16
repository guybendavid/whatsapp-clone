import { FC, useState, SyntheticEvent, useContext } from "react";
import { History, LocationState } from "history";
import { AppContext, AppContextType } from "contexts/AppContext";
import { Link } from "react-router-dom";
import { handleAuth } from "services/auth";
import { Avatar, Button, TextField, Typography } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "services/graphql";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import "./Forms.scss";

interface Props {
  history: History<LocationState>;
}

const Login: FC<Props> = ({ history }) => {
  const { handleErrors } = useContext(AppContext) as AppContextType;
  const [formValues, setFormValues] = useState({ username: "", password: "" });
  const { username, password } = formValues;

  const [login] = useMutation(LOGIN_USER, {
    onCompleted: (data) => handleAuth(data.login, history),
    onError: (error) => handleErrors(error)
  });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    login({ variables: { ...formValues } });
  };

  return (
    <div className="login-container">
      <Avatar>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField required variant="outlined" margin="normal" fullWidth label="username" autoComplete="Username" value={username} onChange={(e) => setFormValues({ ...formValues, username: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="password" autoComplete="Password" value={password} type="password" onChange={(e) => setFormValues({ ...formValues, password: e.target.value })} />
        <Link to="/register">Don't have an account yet?</Link>
        <Button type="submit" fullWidth variant="contained">Login</Button>
      </form>
    </div>
  );
};

export default Login;