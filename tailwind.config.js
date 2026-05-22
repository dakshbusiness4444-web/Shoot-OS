/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Backgrounds & surfaces (was warm ivory → now clean white/cool-gray)
        ivory: {
          50:  '#FFFFFF',
          100: '#F8FAFF',
          200: '#EEF1F8',
          300: '#DDE3EE',
          400: '#C5CEDF',
        },
        // ── Subtle borders & fills (was warm sand → now light blue-gray)
        sand: {
          100: '#F0F4FF',
          200: '#E2E8F8',
          300: '#C8D3EC',
          400: '#A8B8D8',
        },
        // ── PRIMARY action color (was warm camel/tan → now Indigo)
        camel: {
          100: '#EEF2FF',
          200: '#E0E7FF',
          300: '#C7D2FE',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
        },
        // ── Secondary accent (was warm earth/brown → now Blue)
        earth: {
          200: '#DBEAFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        // ── Text & UI chrome (was warm dark → now cool Slate)
        ink: {
          100: '#E2E8F0',
          200: '#CBD5E1',
          400: '#64748B',
          600: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // ── Success / done (Emerald — unchanged)
        moss: {
          100: '#D1FAE5',
          200: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        // ── Error / warning (Rose/Red — updated to cleaner red)
        rose: {
          100: '#FEE2E2',
          300: '#FCA5A5',
          500: '#EF4444',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        soft:   '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.04)',
        card:   '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(99,102,241,0.05)',
        lifted: '0 4px 20px rgba(99,102,241,0.12), 0 1px 4px rgba(15,23,42,0.05)',
        inner:  'inset 0 1px 3px rgba(15,23,42,0.06)',
        glow:   '0 0 0 3px rgba(99,102,241,0.15)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pop': {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '60%':  { transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(99,102,241,0.15)' },
        },
        'bar-grow': {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        'backdrop-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sheet-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'auth-brand': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-field1': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-field2': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-field3': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-btn': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-footer': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up':       'fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':      'scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right':   'slide-right 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'float':         'float 3s ease-in-out infinite',
        'shimmer':       'shimmer 2.5s linear infinite',
        'pop':           'pop 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'glow-pulse':    'glow-pulse 2s ease-in-out infinite',
        'bar-grow':      'bar-grow 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'backdrop-in':   'backdrop-in 0.2s ease both',
        'sheet-up':      'sheet-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'auth-brand':    'auth-brand 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'auth-field1':   'auth-field1 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both',
        'auth-field2':   'auth-field2 0.5s 0.18s cubic-bezier(0.16,1,0.3,1) both',
        'auth-field3':   'auth-field3 0.5s 0.26s cubic-bezier(0.16,1,0.3,1) both',
        'auth-btn':      'auth-btn 0.5s 0.34s cubic-bezier(0.16,1,0.3,1) both',
        'auth-footer':   'auth-footer 0.5s 0.5s both',
        'fade-in':       'fade-in 0.3s ease both',
      },
    },
  },
  plugins: [],
}
