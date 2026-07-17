import { motion as Motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

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
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(newProgress);
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isOpen, duration, onClose, startTime]);

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-300';
      case 'warning':
        return 'bg-warning-300';
      case 'error':
        return 'bg-danger-300';
      case 'info':
      default:
        return 'bg-brand-300';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-600';
      case 'warning':
        return 'bg-warning-600';
      case 'error':
        return 'bg-danger-600';
      case 'info':
      default:
        return 'bg-brand-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          >
            <span className="text-white text-xs">✓</span>
          </Motion.div>
        );
      case 'warning':
        return (
          <Motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          >
            <span className="text-white text-xs">⚠</span>
          </Motion.div>
        );
      case 'error':
        return (
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          >
            <span className="text-white text-xs">✕</span>
          </Motion.div>
        );
      case 'info':
      default:
        return (
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
          >
            <span className="text-white text-xs">i</span>
          </Motion.div>
        );
    }
  };

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
          <div className={`${getBackgroundColor()} ml-auto w-full max-w-sm overflow-hidden rounded-lg border border-white/10 text-white shadow-lg`}>
            <div className="px-4 py-3 flex items-center space-x-3">
              {getIcon()}
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
              <Motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="ml-2 shrink-0 text-white/80 transition-colors hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </Motion.button>
            </div>

            <div className="h-1.5 bg-black/20 w-full">
              <Motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05 }}
                className={`h-full ${getProgressBarColor()} shadow-sm transition-all duration-50`}
              />
            </div>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
