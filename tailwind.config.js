/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdfaf0',
          100: '#faf3d4',
          200: '#f4e4a6',
          300: '#ead170',
          400: '#d4af37',
          500: '#c49a1e',
          600: '#a17c16',
          700: '#7d5e14',
          800: '#634a16',
          900: '#533e17',
        },
        dark: {
          50:  '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a',
          950: '#0d0d0d',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'serif'],
        body: ['Jost', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
        'slide-down': 'slideDown 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(212,175,55,0)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'gold': '0 4px 24px rgba(212,175,55,0.25)',
        'gold-lg': '0 8px 40px rgba(212,175,55,0.35)',
        'luxury': '0 20px 60px rgba(0,0,0,0.3)',
        'card': '0 2px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.15)',
      }
    }
  },
  plugins: []
};
