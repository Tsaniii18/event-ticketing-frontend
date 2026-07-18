export const readStoredUser = () => {
  const storedUser = sessionStorage.getItem("user");

  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const readStoredToken = () => sessionStorage.getItem("token");

export const readSession = () => ({
  token: readStoredToken(),
  user: readStoredUser(),
});

export const saveStoredUser = (user) => {
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const saveSession = (token, user) => {
  sessionStorage.setItem("token", token);
  saveStoredUser(user);
};

export const saveLastTransaction = (transactionId, total) => {
  sessionStorage.setItem("last_transaction_id", transactionId);
  sessionStorage.setItem("last_transaction_total", total);
};

export const clearStoredSession = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export const decodeTokenPayload = (token) => {
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const readTokenPayload = () => decodeTokenPayload(readStoredToken());

export const getEventAccessFlags = (payload, ownerId) => {
  const isOwner = Boolean(payload && payload.user_id === ownerId);
  const isAdmin = payload?.role === "admin";
  const isOrganizer = payload?.role === "organizer";

  return {
    isAdmin,
    isAuthenticated: Boolean(payload),
    isOrganizer,
    isOwner,
    isRegularUser:
      payload?.role === "user" && !isOwner && !isAdmin && !isOrganizer,
  };
};

export const hasStoredUser = () => sessionStorage.getItem("user") !== null;

export const getStoredUserRole = () => readStoredUser()?.role || null;
