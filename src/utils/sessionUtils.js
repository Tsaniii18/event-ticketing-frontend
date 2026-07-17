export const readSession = () => {
  const storedUser = sessionStorage.getItem("user");

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: sessionStorage.getItem("token"),
  };
};

export const readStoredUser = () => {
  const storedUser = sessionStorage.getItem("user");

  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const hasStoredUser = () => sessionStorage.getItem("user") !== null;

export const getStoredUserRole = () => readStoredUser()?.role || null;
