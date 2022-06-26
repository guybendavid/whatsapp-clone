import { css } from "@emotion/css";

export const authFormStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  & > div {
    &:nth-child(1) {
      background: var(--green-color);
    }
  }

  form {
    & > div {
      margin-bottom: 0;
    }

    div {
      .MuiFormLabel-root.Mui-focused {
        color: var(--green-color);
      }

      .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: var(--green-color);
      }
    }

    a {
      color: #175aa7;
      text-decoration: none;
      display: inline-block;
      margin: 16px 0;

      &:hover {
        opacity: 0.8;
      }
    }

    button {
      color: white;
      background: var(--green-color);
      text-transform: capitalize;

      &:hover {
        background-color: rgb(0, 105, 95);
      }
    }
  }
`;