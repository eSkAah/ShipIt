/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Color System - ShipIt Design System
      colors: {
        // Primary: Gold
        gold: {
          50: '#FFFEF0',
          100: '#FFFBD6',
          200: '#FFF7AD',
          300: '#FFF284',
          400: '#FFED5B',
          500: '#FFD700', // Main gold
          600: '#E6C200',
          700: '#B39700',
          800: '#806C00',
          900: '#4D4100',
          950: '#332B00',
        },
        // Secondary: Purple
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED', // Main purple
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B0764',
          950: '#2E0550',
        },
        // Semantic Colors
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // shadcn/ui compatibility (keep for existing components)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // Typography
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: '72px',
        section: '52px',
      },
      lineHeight: {
        tight: '1.1',
        hero: '84px',
        section: '62px',
      },

      // Spacing (Creatikk pattern)
      spacing: {
        19: '76px', // Section padding
        30: '120px', // Large gaps
      },

      // Shadows
      boxShadow: {
        'gold-glow': '-7px 0px 20px -4px rgba(255, 215, 0, 0.5)',
        'purple-glow': '-7px 0px 20px -4px rgba(124, 58, 237, 0.5)',
        'gold-glow-hover': '-7px 0px 30px -4px rgba(255, 215, 0, 0.7)',
        card: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },

      // Border Radius
      borderRadius: {
        premium: '22px',
        input: '12px',
        // shadcn/ui compatibility
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Animations
      transitionDuration: {
        700: '700ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        accent: '30px',
        background: '100px',
      },

      // Keyframes & Animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 700ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
