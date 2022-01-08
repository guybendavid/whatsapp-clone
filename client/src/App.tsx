import { useEffect } from "react";
import { AppContextProvider } from "contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { useMediaQuery } from "@material-ui/core";
import useLocalStorageTracker from "hooks/use-local-storage-tracker";
import AppRouter from "AppRouter/AppRouter";
import "styles/Style.scss";

const App = () => {
  const isUnsupported = useMediaQuery("(max-width:950px)");
  const { listen: listenToChangesInLS } = useLocalStorageTracker();

  useEffect(() => {
    listenToChangesInLS();
    // eslint-disable-next-line
  }, []);

  return isUnsupported ?
    <div style={{ height: "100vh", background: "#dddbd1" }}>
      <h1>Sorry, this resolution is not supported yet &#128577;</h1>
    </div>
    :
    <AppContextProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppContextProvider>;
};

export default App;