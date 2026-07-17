import { useCallback, useState } from "react";
import { readSession } from "../utils";

export default function useSessionUser() {
  const [session, setSession] = useState(readSession);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setSession({ user: null, token: null });
  }, []);

  return {
    ...session,
    isAuthenticated: Boolean(session.user && session.token),
    clearSession,
  };
}
