import React from "react";
import { Loader2 } from "lucide-react";

export function Loader({ size = "md", text = "" }) {
  const sizes = { sm: 16, md: 32, lg: 48 };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        size={sizes[size] || 32}
        className="text-fire-core animate-spin"
      />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-void flex items-center justify-center">
      <Loader size="lg" text="Loading VendorSync..." />
    </div>
  );
}
