/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        accent: {
          red: '#EF4444',
          gold: '#F59E0B',
          purple: '#7C3AED',
        },
        dark: {
          DEFAULT: '#0A0A0F',
          100: '#12121A',
          200: '#1A1A27',
          300: '#22223A',
          400: '#2D2D4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cinema-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #1A0A2E 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)' }, '50%': { boxShadow: '0 0 25px rgba(124, 58, 237, 0.9)' } },
        shimmer: { '0%': { backgroundPosition: '-200px 0' }, '100%': { backgroundPosition: 'calc(200px + 100%) 0' } },
      }
    }
  },
  plugins: [],
};
