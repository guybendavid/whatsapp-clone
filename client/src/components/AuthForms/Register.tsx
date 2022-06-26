import { useState, useContext, SyntheticEvent, ChangeEvent } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { Link } from "react-router-dom";
import { authFormStyle } from "./shared-styles";
import { handleAuth } from "services/auth";
import { Avatar, Button, TextField, Typography, OutlinedTextFieldProps } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "services/graphql";
import { getFormValidationErrors } from "@guybendavid/utils";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

const textFieldProps = { required: true, variant: "outlined", margin: "normal", fullWidth: true } as OutlinedTextFieldProps;

const Register = () => {
  const { handleServerErrors, setSnackBarError } = useContext(AppContext) as AppContextType;
  const [formValues, setFormValues] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const { firstName, lastName, username } = formValues;

  const [register] = useMutation(REGISTER_USER, {
    onCompleted: ({ register: data }) => handleAuth({ user: { ...data.user, firstName, lastName, username }, token: data.token }),
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

    await register({ variables: formValues });
  };

  return (
    <div className={authFormStyle}>
      <Avatar>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1">Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField {...textFieldProps} label="first name" autoComplete="First Name" onChange={(e) => handleOnChange(e, "firstName")} />
        <TextField {...textFieldProps} label="last name" autoComplete="Last Name" onChange={(e) => handleOnChange(e, "lastName")} />
        <TextField {...textFieldProps} label="username" autoComplete="Username" onChange={(e) => handleOnChange(e, "username")} />
        <TextField {...textFieldProps} label="password" autoComplete="Password" type="password" onChange={(e) => handleOnChange(e, "password")} />
        <Link to="/login">Already have an account?</Link>
        <Button type="submit" fullWidth variant="contained">Register</Button>
      </form>
    </div>
  );
};

export default Register;