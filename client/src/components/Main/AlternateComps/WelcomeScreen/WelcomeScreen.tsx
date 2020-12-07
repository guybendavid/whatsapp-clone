import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import introImg from "../../../images/intro-img.png";
import LaptopIcon from "@material-ui/icons/Laptop";
import "./WelcomeScreen.scss";

const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <img className="phone-img" src={introImg} alt="intro-img" />
      <Typography component="h1">Keep your phone connected</Typography>
      <Typography component="p">
        WhatsApp connects to your phone to sync messages. To reduce data
        <br />
         usage, connect your phone to Wi-Fi.
      </Typography>
      <div className="bottom-section">
        <LaptopIcon />
          WhatsApp is available for Windows.
          <Link to="#">Get it here</Link>
      </div>
    </div>
  );
};

export default WelcomeScreen;