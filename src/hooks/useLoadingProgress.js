import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "../utils";

export default function useLoadingProgress({
  initialProgress = 0,
  interval = 100,
  step = 10,
} = {}) {
  const [progress, setProgress] = useState(initialProgress);
  const timerRef = useRef(null);

  const stopProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetProgress = useCallback(() => {
    stopProgress();
    setProgress(initialProgress);
  }, [initialProgress, stopProgress]);

  const startProgress = useCallback(() => {
    resetProgress();

    timerRef.current = setInterval(() => {
      setProgress((currentProgress) => {
        const nextProgress = clamp(currentProgress + step, 0, 100);

        if (nextProgress === 100) {
          stopProgress();
        }

        return nextProgress;
      });
    }, interval);
  }, [interval, resetProgress, step, stopProgress]);

  useEffect(() => stopProgress, [stopProgress]);

  return {
    progress,
    resetProgress,
    startProgress,
    stopProgress,
  };
}
