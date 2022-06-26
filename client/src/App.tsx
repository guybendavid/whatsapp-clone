import { useEffect } from "react";
import { AppContextProvider } from "contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { css } from "@emotion/css";
import { useMediaQuery } from "@material-ui/core";
import useLocalStorageTracker from "hooks/use-local-storage-tracker";
import AppRouter from "AppRouter/AppRouter";
import "styles/global-styles.css";

const App = () => {
  const isUnsupportedResolution = useMediaQuery("(max-width:950px)");
  const { listen: listenToChangesInLS } = useLocalStorageTracker();

  useEffect(() => {
    listenToChangesInLS();
    // eslint-disable-next-line
  }, []);

  return isUnsupportedResolution ?
    <div className={unsupportedStyle}>
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

const unsupportedStyle = css`
  height: 100vh;
  background: var(--gray-smoke-color);
`;