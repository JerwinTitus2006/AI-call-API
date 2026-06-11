/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-void": "#050505",
        "bg-dark": "#0D0D0D",
        "bg-surface": "#141414",
        "bg-border": "#1F1F1F",
        "fire-core": "#FF2200",
        "fire-mid": "#FF5500",
        "fire-tip": "#FF8C00",
        "neon-glow": "#FF3300",
        ember: "#CC1A00",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A0A0A0",
        "text-dim": "#555555",
        success: "#00FF87",
        warning: "#FF8C00",
        danger: "#FF2200",
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        fire: "0 0 20px rgba(255,51,0,0.4), 0 0 40px rgba(255,51,0,0.2), 0 0 80px rgba(255,51,0,0.1)",
        "fire-sm": "0 0 10px rgba(255,85,0,0.2)",
        "fire-border": "0 0 15px rgba(255,51,0,0.3), inset 0 0 15px rgba(255,51,0,0.05)",
      },
      animation: {
        "pulse-fire": "pulse-fire 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "breathe": "breathe 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-fire": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255,51,0,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(255,51,0,0.5), 0 0 50px rgba(255,51,0,0.2)" },
        },
      },
    },
  },
  plugins: [],
};
