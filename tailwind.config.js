/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ivory: {
          50: '#FAFAF7',
          100: '#F7F3EC',
          200: '#EDE8DC',
          300: '#E0D9CC',
        },
        sand: {
          100: '#EDE4D6',
          200: '#D4C9B5',
          300: '#C4B5A0',
          400: '#B0A08A',
        },
        camel: {
          100: '#E8D9C4',
          200: '#D4BC9A',
          300: '#C4A882',
          400: '#A8906A',
          500: '#8C7455',
        },
        earth: {
          300: '#B8926E',
          400: '#9E7B5A',
          500: '#7A5E42',
          600: '#5C4530',
        },
        ink: {
          900: '#1C1C1A',
          800: '#2D2D2B',
          600: '#4A4A47',
          400: '#6B6B67',
          200: '#A8A8A4',
          100: '#D4D4D0',
        },
        moss: {
          100: '#D0DFD0',
          200: '#B5CCB3',
          400: '#7A9B76',
          500: '#608A5C',
        },
        rose: {
          100: '#F0DDD5',
          300: '#D4A090',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 16px rgba(28,28,26,0.06)',
        card: '0 1px 8px rgba(28,28,26,0.07), 0 4px 24px rgba(28,28,26,0.04)',
        lifted: '0 4px 20px rgba(28,28,26,0.10)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
