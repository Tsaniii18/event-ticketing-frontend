export const NOTIFICATION_TYPE_CONFIG = {
  error: {
    backgroundClass: "bg-danger-600",
    progressClass: "bg-danger-300",
    symbol: "✕",
  },
  info: {
    backgroundClass: "bg-brand-600",
    progressClass: "bg-brand-300",
    symbol: "i",
  },
  success: {
    backgroundClass: "bg-success-600",
    progressClass: "bg-success-300",
    symbol: "✓",
  },
  warning: {
    backgroundClass: "bg-warning-600",
    iconAnimation: {
      animate: { rotate: 0, scale: 1 },
      initial: { rotate: -180, scale: 0 },
    },
    progressClass: "bg-warning-300",
    symbol: "⚠",
  },
};
