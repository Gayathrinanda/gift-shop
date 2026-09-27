/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#fbf5ef', deep: '#f5eadc' },
        rose: {
          DEFAULT: '#b4123f',
          50: '#fdf2f5', 100: '#fce7ec', 200: '#f9cfda', 300: '#f3a7bb',
          400: '#e87494', 500: '#d93f6e', 600: '#b4123f', 700: '#970e35',
          800: '#7d0c2d', 900: '#5f0a22',
        },
        plum: {
          DEFAULT: '#2a0a1f',
          50: '#f7f2f5', 100: '#ede1e8', 200: '#d9c3cf', 300: '#b795a6',
          400: '#8d6478', 500: '#6b4558', 600: '#4f2c40', 700: '#3c1d31',
          800: '#2a0a1f', 900: '#1d0515',
        },
        gold: { DEFAULT: '#c98a2d', light: '#e8b96a', deep: '#a56b1c' },
        mint: { DEFAULT: '#7da98f', deep: '#5c8a70' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px -4px rgba(42,10,31,0.12)',
        lift: '0 12px 32px -8px rgba(42,10,31,0.18)',
        glow: '0 0 40px -8px rgba(201,138,45,0.45)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
