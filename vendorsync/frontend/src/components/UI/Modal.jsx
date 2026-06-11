import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${maxWidth} w-full`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
