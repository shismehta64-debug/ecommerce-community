/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Deep Indigo/Blue
          dark: '#1E293B',
          light: '#3B82F6',
        },
        accent: {
          DEFAULT: '#EAB308', // Saffron/Amber
          light: '#FDE047',
        },
        warmBg: '#FDFBF7', // Warm off-white background
      },
    },
  },
  plugins: [],
}
