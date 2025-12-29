/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      colors: {
        brand: {
          green: '#10b981', // emerald-500
          lightGreen: '#d1fae5', // emerald-100
          dark: '#0f172a', // slate-900
          blue: '#3b82f6', // blue-500
        }
      }
    },
  },
  plugins: [],
};