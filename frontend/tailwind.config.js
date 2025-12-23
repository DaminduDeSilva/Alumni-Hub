/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f2b4c", // Deep Navy
          light: "#1a416a",
          dark: "#081628",
        },
        secondary: {
          DEFAULT: "#c5a059", // Muted Gold
          light: "#d4b373",
          dark: "#a5823d",
        },
        surface: "#f8f9fa",
        text: {
          main: "#333333",
          muted: "#666666",
        },
      },
      fontFamily: {
        headings: ['"Playfair Display"', "serif"],
        body: ['"Lato"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
