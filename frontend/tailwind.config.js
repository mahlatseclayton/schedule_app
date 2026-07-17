/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0A0A0A',
          800: '#1A1A1A',
          700: '#2A2A2A',
        },
        primary: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        }
      }
    },
  },
  plugins: [],
}
