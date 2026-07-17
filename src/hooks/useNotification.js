import { useState, useCallback } from "react";

export default function useNotification() {
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "Notification",
    message: "",
    type: "info"
  });

  const showNotification = useCallback((message, title = "Notification", type = "info") => {
    setNotification({
      isOpen: true,
      title,
      message,
      type
    });

    const timer = setTimeout(() => {
      setNotification(prev => ({ ...prev, isOpen: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
}