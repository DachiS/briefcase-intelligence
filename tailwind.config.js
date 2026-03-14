/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          50: '#1a1a1a',
          100: '#111111',
        },
        paper: {
          DEFAULT: '#F5F0E8',
          dark: '#E8E0D0',
        },
        red: {
          spy: '#C8102E',
          dark: '#8B0000',
        },
        gold: {
          DEFAULT: '#B8960C',
          light: '#D4AF37',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
        'flicker': 'flicker 3s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: 1 },
          '96%, 99%': { opacity: 0.8 },
        },
      },
    },
  },
  plugins: [],
}
