import { CheckCircle2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { clamp, joinClasses } from "../../utils";

export default function LoadingProgress({
  className = "",
  completedLabel = "Unggahan siap",
  label = "Mengunggah",
  progress = 0,
}) {
  const normalizedProgress = clamp(progress, 0, 100);
  const isComplete = normalizedProgress === 100;
  const classes = joinClasses(
    "rounded-xl border border-brand-100 bg-white/80 p-3 shadow-sm",
    className,
  );

  return (
    <div className={classes} role="status" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-700">
          {isComplete ? (
            <CheckCircle2 className="size-4 shrink-0 text-success-600" />
          ) : (
            <LoadingSpinner size="xs" />
          )}
          <span className="truncate">
            {isComplete ? completedLabel : label}
          </span>
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand-700">
          {Math.round(normalizedProgress)}%
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-brand-100"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(normalizedProgress)}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-500 to-brand-600 transition-[width] duration-300 ease-out"
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
}
