"use client";

import React from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "disabled";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Custom Tailwind bg class, e.g. "bg-blue-500 hover:bg-blue-600" — overrides variant bg */
  bgColor?: string;
  /** Custom Tailwind text class, e.g. "text-white" — overrides variant text color */
  textColor?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  /** Shows a spinner and disables the button */
  loading?: boolean;
  /** Stretch to full container width */
  fullWidth?: boolean;
  children?: React.ReactNode;
}

// ─── Style Maps ──────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:bg-gray-100",
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-700 shadow-sm",
  secondary:
    "bg-secondary text-secondary-text hover:bg-primary-100 active:bg-primary-200",
  outline:
    "bg-transparent text-primary border border-primary hover:bg-primary-50 active:bg-primary-100",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
  danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm",
  disabled:
    "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  xl: "h-12 px-6 text-base gap-2.5",
};

const iconSizeClasses: Record<ButtonSize, string> = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-5 h-5",
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ sizeClass }: { sizeClass: string }) {
  return (
    <svg
      fill="currentColor"
      className={sizeClass}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <rect x="11" y="1" width="2" height="5" opacity=".14" />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(30 12 12)"
          opacity=".29"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(60 12 12)"
          opacity=".43"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(90 12 12)"
          opacity=".57"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(120 12 12)"
          opacity=".71"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(150 12 12)"
          opacity=".86"
        />
        <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" />
        <animateTransform
          attributeName="transform"
          type="rotate"
          calcMode="discrete"
          dur="0.75s"
          values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Button({
  variant = "default",
  size = "md",
  bgColor,
  textColor,
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || variant === "disabled" || loading;

  // Build class list — custom bgColor / textColor override variant colours
  const base =
    "inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none cursor-pointer font-bold";

  const variantStyle = variantClasses[variant];
  const sizeStyle = sizeClasses[size];
  const iconSize = iconSizeClasses[size];
  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle =
    isDisabled && variant !== "disabled" ? "opacity-60 cursor-not-allowed" : "";

  const classes = [
    base,
    variantStyle,
    sizeStyle,
    widthStyle,
    disabledStyle,
    bgColor ?? "",
    textColor ?? "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconEl = loading ? (
    <Spinner sizeClass={iconSize} />
  ) : icon ? (
    <span
      className={`flex-shrink-0 ${iconSize} flex items-center justify-center`}
    >
      {icon}
    </span>
  ) : null;

  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={classes}
      {...rest}
    >
      {iconEl && iconPosition === "left" && iconEl}
      {children}
      {iconEl && iconPosition === "right" && iconEl}
    </button>
  );
}
