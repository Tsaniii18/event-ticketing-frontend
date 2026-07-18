import { motion as Motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import { joinClasses } from "../../utils";

const VARIANT_CLASSES = {
  page: "min-h-screen bg-app px-4",
  section: "min-h-64 rounded-2xl border border-brand-100 bg-white/80 px-6 shadow-sm",
  plain: "min-h-48 px-4",
  compact: "min-h-28 px-4",
};

const SPINNER_SIZES = {
  page: "xl",
  section: "lg",
  plain: "lg",
  compact: "md",
};

export default function LoadingState({
  className = "",
  description,
  label = "Memuat data...",
  variant = "plain",
}) {
  const classes = joinClasses(
    "relative grid place-items-center overflow-hidden",
    VARIANT_CLASSES[variant],
    className,
  );

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={classes}
      role="status"
      aria-live="polite"
    >
      <div className="relative z-10 flex max-w-sm flex-col items-center text-center">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 shadow-sm">
          <LoadingSpinner size={SPINNER_SIZES[variant]} />
        </div>
        <p className="mt-5 font-semibold text-gray-700">{label}</p>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        )}
        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <Motion.span
              key={index}
              className="size-1.5 rounded-full bg-brand-400"
              animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute -left-16 -top-16 size-40 rounded-full bg-brand-100/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -right-12 size-48 rounded-full bg-purple-100/30 blur-3xl"
        aria-hidden="true"
      />
    </Motion.div>
  );
}
