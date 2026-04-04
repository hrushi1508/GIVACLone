/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'giva-pink': '#eec5c5',
        'giva-dark': '#212121',
        'giva-sand': '#f9f6f2',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}