import React from "react";

export function Card({ children, className = "", active = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card p-6 ${active ? "card-active animate-breathe" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
