/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        coral: {
          50: '#FFF5F5',
          100: '#FFE8E8',
          200: '#FFD0D0',
          300: '#FFB0B0',
          400: '#FF8A8A',
          500: '#FF6B6B',
          600: '#ED4E4E',
          700: '#D63636',
          800: '#B52525',
          900: '#8A1A1A',
        },
        teal: {
          50: '#F0FBFA',
          100: '#D5F4F1',
          200: '#AEE9E3',
          300: '#7DD8CF',
          400: '#4ECDC4',
          500: '#2EB8AF',
          600: '#1E9A92',
          700: '#1B7B75',
          800: '#1A615D',
          900: '#1A504D',
        },
        sun: {
          50: '#FFFDF5',
          100: '#FFF8DE',
          200: '#FFEFA8',
          300: '#FFE66D',
          400: '#FFDB3E',
          500: '#F8C80B',
          600: '#D8A500',
          700: '#AE7F00',
          800: '#8A6400',
          900: '#735200',
        },
        indigo: {
          50: '#F3F5FF',
          100: '#E6E9FE',
          200: '#CCD3FD',
          300: '#A5B3FB',
          400: '#7E90F8',
          500: '#5C7AEA',
          600: '#445FDB',
          700: '#384CC7',
          800: '#303FA5',
          900: '#2E3A84',
        },
        cream: {
          50: '#FFFDFB',
          100: '#FAF6F2',
          200: '#F5EFE8',
          300: '#EEE4D8',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        card: '0 8px 30px -8px rgba(0, 0, 0, 0.10)',
        float: '0 12px 40px -12px rgba(255, 107, 107, 0.25)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #FF6B6B 0%, #FFB088 100%)',
        'gradient-cool': 'linear-gradient(135deg, #4ECDC4 0%, #5C7AEA 100%)',
        'gradient-sun': 'linear-gradient(135deg, #FFE66D 0%, #FFB088 100%)',
        'gradient-soft': 'linear-gradient(180deg, #FAFAFA 0%, #F5F0EB 100%)',
      },
    },
  },
  plugins: [],
};
