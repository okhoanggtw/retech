import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F5F7",
        ink: "#1D1D1F",
        graphite: "#6E6E73",
        mist: "#D2D2D7",
        cobalt: { DEFAULT: "#2F4BFF", dark: "#2238D6", soft: "#E8ECFF" },
        grade: { DEFAULT: "#12A150", soft: "#E3F6EB" },
        amber: { DEFAULT: "#C77C02", soft: "#FDF1DC" },
        danger: { DEFAULT: "#D70015", soft: "#FDE7E9" },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.035em" },
      maxWidth: { page: "1200px" },
      borderRadius: { xl2: "1.25rem", xl3: "1.75rem" },
    },
  },
  plugins: [],
} satisfies Config;
