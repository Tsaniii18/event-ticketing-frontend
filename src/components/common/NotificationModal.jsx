import { motion as Motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";
import {
  calculatePercentage,
  clamp,
  NOTIFICATION_TYPE_CONFIG,
} from "../../utils";

export default function NotificationModal({
  isOpen,
  onClose,
  title = "Notification",
  message,
  type = "info",
  duration = 5000
}) {
  const [progress, setProgress] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const typeConfig =
    NOTIFICATION_TYPE_CONFIG[type] || NOTIFICATION_TYPE_CONFIG.info;

  useEffect(() => {
    if (!isOpen) return;

    setProgress(100);
    setStartTime(Date.now());

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = clamp(
        100 - calculatePercentage(elapsed, duration),
        0,
        100,
      );
      setProgress(newProgress);
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isOpen, duration, onClose, startTime]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0, x: 100, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.3
          }}
          className="fixed top-20 right-4 left-4 z-70 sm:left-auto"
        >
          <div className={`${typeConfig.backgroundClass} ml-auto w-full max-w-sm overflow-hidden rounded-lg border border-white/10 text-white shadow-lg`}>
            <div className="px-4 py-3 flex items-center space-x-3">
              <Motion.div
                initial={typeConfig.iconAnimation?.initial || { scale: 0 }}
                animate={typeConfig.iconAnimation?.animate || { scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
              >
                <span className="text-white text-xs">
                  {typeConfig.symbol}
                </span>
              </Motion.div>
              <div className="flex-1">
                <Motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-semibold text-sm"
                >
                  {title}
                </Motion.p>
                <Motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm opacity-90"
                >
                  {message}
                </Motion.p>
              </div>
              <Button unstyled
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="ml-2 shrink-0 text-white/80 transition-colors hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-1.5 bg-black/20 w-full">
              <Motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
                className={`h-full ${typeConfig.progressClass} shadow-sm transition-all duration-50`}
              />
            </div>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
