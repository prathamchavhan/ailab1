/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        header: "#103E50",
      },
      backgroundImage: {
        "gradient-main": "linear-gradient(to right, #2DC7DB, #2B7ECF)",
      },
    },
  },
  plugins: [],
};
