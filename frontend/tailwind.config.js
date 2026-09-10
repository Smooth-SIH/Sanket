/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0F2942',
          'navy-dark': '#0A1C2A',
          blue: '#1E40AF',
          'blue-light': '#EFF6FF',
          'blue-hover': '#1D4ED8',
          saffron: '#FF9933',
          green: '#15803D',
          'green-light': '#F0FDF4',
          yellow: '#B45309',
          'yellow-light': '#FEFCE8',
          orange: '#C2410C',
          'orange-light': '#FFF7ED',
          red: '#B91C1C',
          'red-light': '#FEF2F2',
          border: '#E2E8F0',
          canvas: '#F8FAFC',
          card: '#FFFFFF'
        },
        // Backward compatibility mapping to keep existing components safe
        sanket: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          deep: '#0F2942',
          cyan: '#1E40AF',
          orange: '#C2410C',
          danger: '#B91C1C',
          success: '#15803D',
          warning: '#B45309',
          muted: '#64748B'
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'gov-card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'gov-dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
