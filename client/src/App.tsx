import { AppContextProvider } from "contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { useMediaQuery } from "@material-ui/core";
import AppRouter from "AppRouter/AppRouter";
import "styles/Style.scss";

const App = () => {
  const isAllowedBreakpoint = useMediaQuery("(min-width:950px)");

  return isAllowedBreakpoint ?
    <AppContextProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppContextProvider > :
    <div style={{ height: "100vh", background: "#dddbd1" }}>
      <h1>Sorry, this resolution is not supported yet &#128577;</h1>
    </div>;
};

export default App;