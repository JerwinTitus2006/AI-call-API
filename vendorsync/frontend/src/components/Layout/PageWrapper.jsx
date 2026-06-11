import React from "react";
import { Sidebar } from "./Sidebar";

export function PageWrapper({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-void">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
