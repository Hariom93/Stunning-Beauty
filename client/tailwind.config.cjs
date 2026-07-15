module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(219, 78%, 50%)',
          50:  'hsl(219, 100%, 97%)',
          100: 'hsl(219, 100%, 93%)',
          200: 'hsl(219, 90%, 83%)',
          300: 'hsl(219, 85%, 72%)',
          400: 'hsl(219, 80%, 62%)',
          500: 'hsl(219, 78%, 50%)',
          600: 'hsl(219, 78%, 42%)',
          700: 'hsl(219, 78%, 35%)',
          800: 'hsl(219, 78%, 28%)',
          900: 'hsl(219, 78%, 20%)',
        },
        secondary: {
          DEFAULT: 'hsl(21, 90%, 55%)',
          500: 'hsl(21, 90%, 55%)',
          600: 'hsl(21, 90%, 45%)',
        },
        accent: {
          DEFAULT: 'hsl(164, 70%, 42%)',
          500: 'hsl(164, 70%, 42%)',
        },
        rose: {
          500: 'hsl(350, 89%, 60%)',
        },
        dark: {
          800: 'hsl(222, 20%, 12%)',
          850: 'hsl(222, 22%, 9%)',
          900: 'hsl(222, 25%, 6%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, hsl(219,78%,15%) 0%, hsl(240,60%,25%) 50%, hsl(280,60%,20%) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'cta-gradient': 'linear-gradient(90deg, hsl(219,78%,50%), hsl(280,70%,55%))',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.16)',
        'glow': '0 0 40px rgba(99,132,255,0.25)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
