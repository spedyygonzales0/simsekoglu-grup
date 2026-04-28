import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#071427",
          800: "#0B1F3A",
          700: "#112A4E"
        },
        gold: {
          500: "#C79B4A",
          400: "#D8B16A"
        },
        cloud: {
          50: "#F7F8FA",
          100: "#ECEFF4",
          200: "#D8DEE8"
        }
      },
      fontFamily: {
        sans: ["Inter", "'Segoe UI'", "Tahoma", "sans-serif"],
        display: ["Montserrat", "Inter", "'Segoe UI'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 12px 30px -14px rgba(7, 20, 39, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
