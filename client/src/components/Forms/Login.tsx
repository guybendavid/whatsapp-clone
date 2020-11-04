import React, { useState, SyntheticEvent, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { Link } from "react-router-dom";
import { handleAuth } from "../../services/auth";
import { Avatar, Button, TextField, Typography } from "@material-ui/core";
import { gql, useMutation } from "@apollo/client";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import "./Forms.scss";

const LOGIN_USER = gql`
mutation LoginUser($username: String! $password: String!) {
  login(username: $username password: $password) {
    id
    username
    image
    token
  }
}
`;

interface Props {
  history: any;
}

const Login: React.FC<Props> = ({ history }) => {
  const { handleErrors } = useContext(AppContext);
  const [login] = useMutation(LOGIN_USER);
  const [formValues, setFormValues] = useState({ username: "", password: "" });

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { username, password } = formValues;

    if (username && password) {
      try {
        const user = await login({ variables: { username, password } });
        handleAuth(user.data?.login, history);
      } catch (err) {
        handleErrors(err);
      }
    }
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