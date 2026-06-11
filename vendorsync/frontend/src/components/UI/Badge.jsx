import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    distributor: "badge-distributor",
    vendor: "badge-vendor",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    default: "badge bg-bg-surface text-text-secondary border border-bg-border",
  };
  return (
    <span className={`badge ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
