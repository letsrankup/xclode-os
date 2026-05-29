/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#05050a',
          card: '#0a0a14',
          neon: '#00ffcc',
          glow: 'rgba(0, 255, 204, 0.2)'
        }
      }
    },
  },
  plugins: [],
}
