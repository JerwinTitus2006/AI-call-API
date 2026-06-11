import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0D0D0D",
            color: "#FFFFFF",
            border: "1px solid #1F1F1F",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#00FF87", secondary: "#0D0D0D" },
          },
          error: {
            iconTheme: { primary: "#FF2200", secondary: "#0D0D0D" },
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);
