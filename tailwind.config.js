/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // added for dark mode support
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '33%': { 'background-position': '100% 50%' },
          '66%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      animation: {
        'gradient-shift': 'gradientShift 30s ease infinite',
      },
    },
  },
  plugins: [],
}