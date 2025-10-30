/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3D75C4",
        secondary: "#F5F7FA", // fundo clarinho como no Figma
        textDark: "#1E1E1E",
        textLight: "#6B7280",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"], // Inter fica bem próximo do Figma
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 2px 6px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
