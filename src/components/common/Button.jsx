import { createElement, forwardRef } from "react";
import { motion as Motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const VARIANT_CLASSES = {
  custom: "",
  primary: "ui-button-primary",
  secondary: "ui-button-secondary",
  muted: "ui-button-muted",
  danger: "ui-button-danger",
  success: "ui-button-success",
  warning: "ui-button-warning",
  ghost: "ui-button-ghost",
};

const SOFT_TONE_CLASSES = {
  brand: "ui-button-soft-brand",
  success: "ui-button-soft-success",
  warning: "ui-button-soft-warning",
  danger: "ui-button-soft-danger",
  purple: "ui-button-soft-purple",
  neutral: "ui-button-soft-neutral",
};

const SIZE_CLASSES = {
  sm: "ui-button-sm",
  md: "ui-button-md",
  lg: "ui-button-lg",
  icon: "ui-button-icon",
};

const Button = forwardRef(function Button(
  {
    as: Component = Motion.button,
    children,
    className = "",
    disabled = false,
    fullWidth = false,
    loading = false,
    loadingLabel,
    size = "md",
    tone = "brand",
    type,
    unstyled = false,
    variant = "primary",
    ...props
  },
  ref,
) {
  const variantClass =
    variant === "soft"
      ? SOFT_TONE_CLASSES[tone]
      : VARIANT_CLASSES[variant];
  const classes = unstyled
    ? className
    : [
        "ui-button",
        variantClass,
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ");
  const spinnerTone = ["ghost", "muted", "secondary", "soft"].includes(variant)
    ? "brand"
    : "light";

  const content = (
    <>
      {loading && <LoadingSpinner size="xs" tone={spinnerTone} />}
      {loading ? loadingLabel || children : children}
    </>
  );

  return createElement(
    Component,
    {
      ref,
      type,
      className: classes,
      disabled: disabled || loading,
      "aria-busy": loading || undefined,
      ...props,
    },
    content,
  );
});

export default Button;
