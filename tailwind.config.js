/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fk: {
          blue: '#2874f0',
          'blue-dark': '#1c5bc7',
          yellow: '#ffe11b',
          orange: '#ff9f00',
          green: '#388e3c',
          red: '#ff6161',
          text: '#212121',
          muted: '#878787',
          border: '#e0e0e0',
          bg: '#f1f3f6',
        },
        meesho: {
          pink: '#f43397',
          purple: '#7c2ae8',
        },
      },
      borderRadius: {
        fk: '4px',
      },
      boxShadow: {
        fk: '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
        'fk-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'Arial', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
