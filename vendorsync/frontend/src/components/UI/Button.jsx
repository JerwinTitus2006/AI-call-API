import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "fire",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const base = {
    fire: "btn-fire",
    ghost: "btn-ghost",
    danger: "btn-danger",
  }[variant] || "btn-fire";

  const sizes = {
    sm: "text-xs px-3 py-2",
    md: "",
    lg: "text-base px-8 py-4",
  }[size] || "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
