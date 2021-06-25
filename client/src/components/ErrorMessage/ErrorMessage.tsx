import { useContext, useState, useEffect } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { sanitize } from "dompurify";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

const ErrorMessage = () => {
  const { error, clearError } = useContext(AppContext) as AppContextType;
  const [open, setOpen] = useState(false);

  const closeError = () => {
    clearError();
    setOpen(false);
  };

  useEffect(() => {
    error ? setOpen(true) : closeError();
    // eslint-disable-next-line
  }, [error]);

  return (
    <>
      {error && <Snackbar open={open} autoHideDuration={5000} onClose={closeError}>
        <MuiAlert elevation={6} variant="filled" severity="error" onClose={closeError}>
          <div dangerouslySetInnerHTML={{ __html: sanitize(error) }}></div>
        </MuiAlert>
      </Snackbar>}
    </>
  );
};

export default ErrorMessage;