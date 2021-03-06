import { useState } from "react";
import { AppContextProvider } from "contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { useMediaQuery } from "@material-ui/core";
import AppRouter from "AppRouter/AppRouter";
import "styles/Style.scss";

const App = () => {
  const [history, setHistory] = useState({});
  const isUnsupported = useMediaQuery("(max-width:950px)");

  return isUnsupported ?
    <div style={{ height: "100vh", background: "#dddbd1" }}>
      <h1>Sorry, this resolution is not supported yet &#128577;</h1>
    </div>
    :
    <AppContextProvider history={history}>
      <BrowserRouter>
        <AppRouter setHistory={setHistory} />
      </BrowserRouter>
    </AppContextProvider>;
};

export default App;