/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#03060f',
          900: '#050b1c',
          800: '#0a1430',
          700: '#0f1d44',
          600: '#142658',
          500: '#1b3070',
        },
        electric: {
          50: '#e5fbff',
          100: '#bff4ff',
          200: '#7be7ff',
          300: '#36d8ff',
          400: '#06c4ff',
          500: '#00a8f0',
          600: '#0084c7',
          700: '#006699',
        },
        sapphire: {
          900: '#020616',
          800: '#040b25',
          700: '#071236',
          600: '#0a1b4f',
        },
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(circle at 70% 30%, rgba(6,196,255,0.25), transparent 60%)',
        'hero-grid':
          "linear-gradient(rgba(6,196,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(6,196,255,0.06) 1px, transparent 1px)",
        'sapphire-deep':
          'linear-gradient(135deg, #03060f 0%, #050b1c 40%, #071236 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(6,196,255,0.55)',
        'glow-sm': '0 0 18px -4px rgba(6,196,255,0.45)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 30px -10px rgba(6,196,255,0.4)' },
          '50%': { boxShadow: '0 0 50px -8px rgba(6,196,255,0.7)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        slideUp: 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
