import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Sparkle palette: deep ink + cyan + violet accents
        ink: {
          950: "#05060f",
          900: "#0a0c1b",
          800: "#11142a",
          700: "#1a1d3a",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(34,211,238,0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(139,92,246,0.18), transparent 50%)",
        "neon-gradient":
          "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 50%, #ec4899 100%)",
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(34, 211, 238, 0.5), 0 0 60px -20px rgba(139, 92, 246, 0.4)",
        "glow-violet": "0 0 30px -5px rgba(139, 92, 246, 0.6)",
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "blob": "blob 18s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-50px) scale(1.1)" },
          "66%": { transform: "translate(-20px,20px) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
