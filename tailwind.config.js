/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f2640', 800: '#1f3a5f', 700: '#2a4f7c',
          500: '#5d7a9a', 300: '#a3b6cb',
        },
        gold: {
          700: '#a37f42', 600: '#c9a25f', 500: '#d4b276', 200: '#f1e3c4',
        },
        terra: { 700: '#a35a36', 600: '#b56b3e', 500: '#cc8b5d' },
        sea:   { 700: '#4a7a7a', 500: '#7a9080' },
        cream: { 50: '#faf6ee', 100: '#f5efe2', 200: '#ece4d2', 300: '#ddd2bc' },
        ink:   { 900: '#1a2438', 700: '#3d4a63', 500: '#6b7689' },
      },
      fontFamily: {
        serif: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:  ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
