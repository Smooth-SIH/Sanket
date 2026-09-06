/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanket: {
          bg: '#0a1628',
          card: 'rgba(10, 22, 40, 0.75)',
          deep: '#050c17',
          cyan: '#00d4ff',
          orange: '#ff6b35',
          danger: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 212, 255, 0.35)',
        'glow-orange': '0 0 25px rgba(255, 107, 53, 0.4)',
        'glow-red': '0 0 30px rgba(239, 68, 68, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
