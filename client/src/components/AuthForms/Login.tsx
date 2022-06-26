import { useState, useContext, SyntheticEvent, ChangeEvent } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { Link } from "react-router-dom";
import { authFormStyle } from "./shared-styles";
import { handleAuth } from "services/auth";
import { Avatar, Button, TextField, Typography, OutlinedTextFieldProps } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "services/graphql";
import { getFormValidationErrors } from "@guybendavid/utils";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

const textFieldProps = { required: true, variant: "outlined", margin: "normal", fullWidth: true } as OutlinedTextFieldProps;

const Login = () => {
  const { handleServerErrors, setSnackBarError } = useContext(AppContext) as AppContextType;
  const [formValues, setFormValues] = useState({ username: "", password: "" });

  const [login] = useMutation(LOGIN_USER, {
    onCompleted: ({ login: data }) => handleAuth(data),
    onError: (error) => handleServerErrors(error)
  });

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: keyof typeof formValues) =>
    setFormValues({ ...formValues, [field]: e.target.value });

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { message: errorMessage } = getFormValidationErrors(formValues);

    if (errorMessage) {
      setSnackBarError(errorMessage);
      return;
    }

    await login({ variables: formValues });
  };

  return (
    <div className={authFormStyle}>
      <Avatar>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField {...textFieldProps} label="username" autoComplete="Username" onChange={(e) => handleOnChange(e, "username")} />
        <TextField {...textFieldProps} label="password" autoComplete="Password" type="password" onChange={(e) => handleOnChange(e, "password")} />
        <Link to="/register">Don't have an account yet?</Link>
        <Button type="submit" fullWidth variant="contained">Login</Button>
      </form>
    </div>
  );
};

export default Login;