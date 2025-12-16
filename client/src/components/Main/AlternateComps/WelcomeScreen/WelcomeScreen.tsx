import { css, cx } from "@emotion/css";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import { containerStyle } from "../shared-styles";
import { Laptop as LaptopIcon } from "@material-ui/icons";
import introImg from "images/intro-img.png";

export const WelcomeScreen = () => (
  <div className={cx(welcomeScreenStyle, containerStyle)}>
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

const welcomeScreenStyle = css`
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-left: 1px solid rgba(0, 0, 0, 0.07);
  border-bottom: 7px solid #4adf83;

  h1 {
    margin-top: 28px;
    margin-bottom: 18px;
  }

  p {
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-bottom: 34px;
  }

  .phone-img {
    height: 35%;
    max-width: 100%;
  }

  .bottom-section {
    margin-top: 34px;
    color: var(--text-color);
    display: flex;
    align-items: center;
    text-align: center;
    gap: 5px;

    a {
      text-decoration: none;
      color: #07bc4c;
    }
  }
`;
