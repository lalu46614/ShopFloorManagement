/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        running: '#10b981',
        idle: '#f59e0b',
        error: '#ef4444',
        maintenance: '#f97316',
        safe: '#10b981',
        warning: '#f59e0b',
        critical: '#ef4444',
      },
    },
  },
  plugins: [],
}

