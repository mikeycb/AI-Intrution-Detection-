/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0f1d',
          card: '#0f172a',
          cardLight: '#1e293b',
          border: '#1e293b',
          borderLight: '#334155',
          muted: '#64748b',
          text: '#f8fafc',
          blue: '#0284c7',
          cyan: '#06b6d4',
          accent: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
