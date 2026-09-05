import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./templates/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#0B0C0F",
          raised: "#121317",
          sunken: "#07080A",
        },
        ink: {
          DEFAULT: "#F4F5F7",
          muted: "#9AA0AC",
          faint: "#5B616D",
        },
        accent: {
          DEFAULT: "#5B8CFF",
          soft: "#3D5FE0",
          glow: "#8FB3FF",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.16)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
        "glass-strong": "36px",
      },
      borderRadius: {
        glass: "18px",
        control: "12px",
      },
      boxShadow: {
        glass: "0 1px 1px rgba(255,255,255,0.06) inset, 0 8px 30px rgba(0,0,0,0.35)",
        "glass-strong": "0 1px 1px rgba(255,255,255,0.10) inset, 0 16px 48px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "glass-in": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "glass-in": "glass-in 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
