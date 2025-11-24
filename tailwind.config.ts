import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        foilhub: {
          ink: "#0B0E13",
          ocean: "#0A4CFF",
          sea: "#00C2FF",
          foam: "#F5F7FB",
          mist: "#E6ECF7",
          green: "#19C37D"
        }
      },
      boxShadow: {
        soft: "0 8px 30px rgba(10, 76, 255, 0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;
