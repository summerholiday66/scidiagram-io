import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        mist: "#f3f2ef",
        line: "#cfc9bf",
        accent: "#155eef",
        sage: "#5a7d6a"
      },
      boxShadow: {
        panel: "0 12px 32px rgba(17, 17, 17, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
