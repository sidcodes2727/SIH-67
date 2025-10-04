/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b0f19',
        card: '#121826',
        primary: '#64ffda',
        text: '#e6edf3'
      }
    }
  },
  plugins: []
};
