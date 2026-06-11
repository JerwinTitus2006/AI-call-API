import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Input({
  label,
  type = "text",
  error,
  icon,
  className = "",
  ...props
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
            {icon}
          </span>
        )}
        <input
          type={inputType}
          className={`input-fire ${icon ? "pl-10" : ""} ${isPassword ? "pr-10" : ""} ${error ? "border-fire-core" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-secondary transition-colors"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-fire-core">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <textarea
        className={`input-fire resize-none ${error ? "border-fire-core" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-fire-core">{error}</p>}
    </div>
  );
}
