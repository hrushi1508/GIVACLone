/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- PRIMARY PALETTE ---
        'giva-pink': {
          light: '#fdf2f2', // Softest blush for backgrounds
          DEFAULT: '#eec5c5', // Your original brand pink
          deep: '#d4a3a3',   // For hovered buttons/icons
          rose: '#9b6b6b',   // For high-contrast text on pink
        },
        'giva-dark': {
          DEFAULT: '#212121', // Your original charcoal
          muted: '#4a4a4a',   // For secondary text (descriptions)
          light: '#757575',   // For breadcrumbs/placeholders
        },
        'giva-sand': {
          DEFAULT: '#f9f6f2', // Your original champagne/sand
          dark: '#efeae2',    // For subtle section dividers
        },

        // --- NEW LUXURY ACCENTS ---
        'giva-gold': '#c5a059',  // For "Premium" badges or gold jewelry tags
        'giva-silver': '#cbd5e1', // For silver jewelry tags
        'giva-accent': '#f4ebe4', // Warm ivory for card backgrounds
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'], // Professional pairing for body text
      },
      letterSpacing: {
        'luxury': '0.2em', // For those uppercase headings
      }
    },
  },
  plugins: [],
}