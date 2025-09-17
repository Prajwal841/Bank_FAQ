/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        typing: {
          '0%, 20%': { opacity: 0.2 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.2 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 240ms ease-out',
        typing: 'typing 1.2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        gradientShift: 'gradientShift 15s ease infinite',
      },
      colors: {
        bot: {
          bg: '#f3f4f6',
          text: '#111827',
        },
        user: {
          bg: '#2563eb',
          text: '#ffffff',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -6px rgba(0,0,0,0.08), 0 12px 28px -8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};


