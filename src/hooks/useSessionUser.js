import { useCallback, useState } from "react";
import { clearStoredSession, readSession } from "../utils";

export default function useSessionUser() {
  const [session, setSession] = useState(readSession);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession({ user: null, token: null });
  }, []);

  return {
    ...session,
    isAuthenticated: Boolean(session.user && session.token),
    clearSession,
  };
}
