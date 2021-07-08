import { useState, SyntheticEvent, useContext } from "react";
import { History, LocationState } from "history";
import { AppContext, AppContextType } from "contexts/AppContext";
import { Link } from "react-router-dom";
import { handleAuth } from "services/auth";
import { Avatar, Button, TextField, Typography } from "@material-ui/core";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "services/graphql";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import "./Forms.scss";

interface Props {
  history: History<LocationState>;
}

const Register = ({ history }: Props) => {
  const { handleErrors } = useContext(AppContext) as AppContextType;
  const [formValues, setFormValues] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const { username } = formValues;

  const [register] = useMutation(REGISTER_USER, {
    onCompleted: (data) => handleAuth({ ...data.register, username }, history),
    onError: (error) => handleErrors(error)
  });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    register({ variables: { ...formValues } });
  };

  return (
    <div className="register-container">
      <Avatar>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1">Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField required variant="outlined" margin="normal" fullWidth label="first name" autoComplete="First Name" onChange={(e) => setFormValues({ ...formValues, firstName: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="last name" autoComplete="Last Name" onChange={(e) => setFormValues({ ...formValues, lastName: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="username" autoComplete="Username" onChange={(e) => setFormValues({ ...formValues, username: e.target.value })} />
        <TextField required variant="outlined" margin="normal" fullWidth label="password" autoComplete="Password" type="password" onChange={(e) => setFormValues({ ...formValues, password: e.target.value })} />
        <Link to="/login">Already have an account?</Link>
        <Button type="submit" fullWidth variant="contained">Register</Button>
      </form>
    </div>
  );
};

export default Register;