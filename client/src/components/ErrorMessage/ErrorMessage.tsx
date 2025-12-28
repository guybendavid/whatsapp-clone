import { useState, useEffect } from "react";
import { useAppContext } from "contexts/app-context";
import dompurify from "dompurify";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

const { sanitize } = dompurify;

export const ErrorMessage = () => {
  const { snackBarError, clearSnackBarError } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const closeError = () => {
    clearSnackBarError();
    setIsOpen(false);
  };

  useEffect(() => {
    if (snackBarError) {
      setIsOpen(true);
      return;
    }

    closeError();
  }, [snackBarError]);

  return (
    <>
      {snackBarError && (
        <Snackbar open={isOpen} autoHideDuration={5000} onClose={closeError}>
          <MuiAlert elevation={6} variant="filled" severity="error" onClose={closeError}>
            <div dangerouslySetInnerHTML={{ __html: sanitize(snackBarError) }}></div>
          </MuiAlert>
        </Snackbar>
      )}
    </>
  );
};
