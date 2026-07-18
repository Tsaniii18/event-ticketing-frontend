import { joinClasses } from "../../utils";

const SIZE_CLASSES = {
  xs: "size-4",
  sm: "size-5",
  md: "size-10",
  lg: "size-14",
  xl: "size-16",
};

const TONE_CLASSES = {
  brand: {
    core: "bg-brand-100",
    indicator: "border-r-brand-400 border-t-brand-600",
    track: "border-brand-100",
  },
  light: {
    core: "bg-white/30",
    indicator: "border-r-white/70 border-t-white",
    track: "border-white/25",
  },
  neutral: {
    core: "bg-gray-200",
    indicator: "border-r-gray-400 border-t-gray-600",
    track: "border-gray-200",
  },
};

export default function LoadingSpinner({
  className = "",
  label,
  size = "md",
  tone = "brand",
}) {
  const toneClasses = TONE_CLASSES[tone];
  const classes = joinClasses(
    "relative inline-flex shrink-0",
    SIZE_CLASSES[size],
    className,
  );

  return (
    <span
      className={classes}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span
        className={joinClasses(
          "absolute inset-0 rounded-full border-[3px]",
          toneClasses.track,
        )}
      />
      <span
        className={joinClasses(
          "absolute inset-0 animate-spin rounded-full border-[3px] border-transparent",
          toneClasses.indicator,
        )}
      />
      <span
        className={joinClasses(
          "absolute inset-[35%] animate-pulse rounded-full",
          toneClasses.core,
        )}
      />
    </span>
  );
}
