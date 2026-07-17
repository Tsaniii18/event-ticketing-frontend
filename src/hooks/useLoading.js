import { useCallback, useState } from "react";

export default function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const runWithLoading = useCallback(
    async (operation) => {
      startLoading();

      try {
        return await operation();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return {
    isLoading,
    runWithLoading,
    startLoading,
    stopLoading,
  };
}
