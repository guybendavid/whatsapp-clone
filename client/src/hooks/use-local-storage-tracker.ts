import { logout } from "services/auth";

const useLocalStorageTracker = () => {
  const listen = () => window.addEventListener('storage', handleChangesInLocalStorage);

  const handleChangesInLocalStorage = (e: StorageEvent) => {
    const authKeys = ["loggedInUser", "token"];
    const { oldValue, newValue } = e;

    if (localStorage.length === 0 || (e.key && (authKeys.includes(e.key) && newValue !== oldValue))) {
      logout();
    }
  };

  return { listen };
};

export default useLocalStorageTracker;