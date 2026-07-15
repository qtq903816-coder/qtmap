/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fbfaf7',
        ink: '#242a2f',
        clay: '#e97855',
        terracotta: '#f2a07e',
        moss: '#6f927d',
        umber: '#697178',
        fog: '#e8ece8',
      },
      boxShadow: {
        soft: '0 20px 48px rgba(36, 42, 47, 0.08)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Noto Sans SC"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
