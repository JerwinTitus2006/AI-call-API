import React from "react";

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="text-5xl mb-4 opacity-40">{icon}</div>
      )}
      <h3 className="font-display text-2xl text-text-secondary mb-2">{title}</h3>
      {description && (
        <p className="text-text-dim text-sm max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
