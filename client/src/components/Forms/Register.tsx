import React, { useState, SyntheticEvent, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { Link } from "react-router-dom";
import { handleAuth } from "../../services/auth";
import { Avatar, Button, TextField, Typography } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../../services/graphql";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import "./Forms.scss";

interface Props {
  history: any;
}

const Register: React.FC<Props> = ({ history }) => {
  const { handleErrors } = useContext(AppContext);
  const [formValues, setFormValues] = useState({ firstName: "", lastName: "", username: "", password: "" });

  // To do: fix the error when a user with the same username trying to register
  const [register] = useMutation(REGISTER_USER, {
    onError: (error) => handleErrors(error)
  });

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { firstName, lastName, username, password } = formValues;
    const res = await register({ variables: { firstName, lastName, username, password } });

    if (res) {
      res.data.register.username = username;
      handleAuth(res.data.register, history);
    }
  };

  return (
    <div className="register-container">
      <Avatar>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1">Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField required variant="outlined" margin="normal" fullWidth label="first name" autoComplete="First Name" value={formValues.firstName} onChange={(e) => setFormValues({ ...formValues, firstName: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="last name" autoComplete="Last Name" value={formValues.lastName} onChange={(e) => setFormValues({ ...formValues, lastName: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="username" autoComplete="Username" value={formValues.username} onChange={(e) => setFormValues({ ...formValues, username: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="password" autoComplete="Password" value={formValues.password} type="password" onChange={(e) => setFormValues({ ...formValues, password: e.target.value })} />
        <Link to="/login">Already have an account?</Link>
        <Button type="submit" fullWidth variant="contained">Register</Button>
      </form>
    </div>
  );
};

export default Register;