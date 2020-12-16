import React, { useState, SyntheticEvent, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { Link } from "react-router-dom";
import { handleAuth } from "../../services/auth";
import { Avatar, Button, TextField, Typography } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../../services/graphql";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import "./Forms.scss";

interface Props {
  history: any;
}

const Login: React.FC<Props> = ({ history }) => {
  const { handleErrors } = useContext(AppContext);
  const [formValues, setFormValues] = useState({ username: "", password: "" });

  const [login] = useMutation(LOGIN_USER, {
    onCompleted: (data) => handleAuth(data.login, history),
    onError: (error) => handleErrors(error)
  });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const { username, password } = formValues;
    login({ variables: { username, password } });
  };

  return (
    <div className="login-container">
      <Avatar>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField required variant="outlined" margin="normal" fullWidth label="username" autoComplete="Username" value={formValues.username} onChange={(e) => setFormValues({ ...formValues, username: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="password" autoComplete="Password" value={formValues.password} type="password" onChange={(e) => setFormValues({ ...formValues, password: e.target.value })} />
        <Link to="/register">Don't have an account yet?</Link>
        <Button type="submit" fullWidth variant="contained">Login</Button>
      </form>
    </div>
  );
};

export default Login;