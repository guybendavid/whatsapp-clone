import { useContext, useState, useEffect } from "react";
import { AppContext, AppContextType } from "contexts/AppContext";
import { sanitize } from "dompurify";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

const ErrorMessage = () => {
  const { error, clearError } = useContext(AppContext) as AppContextType;
  const [isOpen, setIsOpen] = useState(false);

  const closeError = () => {
    clearError();
    setIsOpen(false);
  };

  useEffect(() => {
    error ? setIsOpen(true) : closeError();
    // eslint-disable-next-line
  }, [error]);

  return (
    <>
      {error && <Snackbar open={isOpen} autoHideDuration={5000} onClose={closeError}>
        <MuiAlert elevation={6} variant="filled" severity="error" onClose={closeError}>
          <div dangerouslySetInnerHTML={{ __html: sanitize(error) }}></div>
        </MuiAlert>
      </Snackbar>}
    </>
  );
};

export default ErrorMessage;