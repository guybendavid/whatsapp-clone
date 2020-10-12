import React from "react";
import { AppContextProvider } from "./contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { useMediaQuery } from "@material-ui/core";
import AppRouter from "./AppRouter/AppRouter";
import "./styles/Style.scss";

const App = () => {
  const isMobile = useMediaQuery("(max-width:950px)");

  return isMobile ?
    (<div style={{ height: "100vh", background: "#dddbd1" }}>
      <h1>Mobile view did not implemented yet :)</h1>
    </div>)
    : (
      <AppContextProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppContextProvider >
    );
};

export default App;