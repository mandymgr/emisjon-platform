/** @type {import('tailwindcss').Config} */
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Oblinor Design System Colors
        'obl-primary': '#124F62',
        'obl-primary-light': '#1C6A7E',
        'obl-primary-lighter': '#278899',
        'obl-primary-dark': '#0C3C4A',
        'obl-neutral': '#F5F5F0',
        'obl-neutral-dark': '#E6E6E0',
        'obl-text': '#0E1A1C',
        'obl-text-muted': 'rgba(14, 26, 28, 0.7)',
        'obl-text-subtle': 'rgba(14, 26, 28, 0.6)',

        // Semantic color system
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Oblinor Typography
        serif: ['"EB Garamond"', ...fontFamily.serif],
        sans: ["Inter", ...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      fontSize: {
        // Editorial Typography Scale
        'display-large': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'title-large': ['1.75rem', { lineHeight: '1.3', letterSpacing: '0' }],
        'title': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0' }],
        'body-large': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'label': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },
      spacing: {
        // Scandinavian spacing scale (generous whitespace)
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Scandinavian subtle shadows
        'soft': '0 2px 8px rgba(18, 79, 98, 0.08)',
        'soft-lg': '0 4px 16px rgba(18, 79, 98, 0.12)',
        'professional': '0 1px 3px rgba(18, 79, 98, 0.1), 0 1px 2px rgba(18, 79, 98, 0.06)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom component classes
    function({ addComponents }) {
      addComponents({
        // Professional Button
        '.btn-professional': {
          '@apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-light tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50': {},
          '@apply bg-[#124F62] text-white hover:bg-[#0C3C4A] dark:hover:bg-[#278899]': {},
          '@apply px-6 py-3 min-h-[44px]': {},
        },
        '.btn-professional-outline': {
          '@apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-light tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50': {},
          '@apply border border-[#124F62] bg-transparent text-[#124F62] hover:bg-[#124F62] hover:text-white': {},
          '@apply px-6 py-3 min-h-[44px]': {},
        },
        '.btn-professional-ghost': {
          '@apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-light tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50': {},
          '@apply text-[#124F62] hover:bg-[#124F62]/10 dark:text-[#278899] dark:hover:bg-[#278899]/10': {},
          '@apply px-6 py-3 min-h-[44px]': {},
        },

        // Professional Input
        '.input-professional': {
          '@apply flex h-12 w-full rounded-md border border-[#E6E6E0] bg-white px-4 py-3 text-sm font-light': {},
          '@apply placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-1': {},
          '@apply disabled:cursor-not-allowed disabled:opacity-50': {},
          '@apply dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40': {},
        },

        // Card Professional
        '.card-professional': {
          '@apply bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-[#E6E6E0] dark:border-white/10 rounded-lg': {},
          '@apply shadow-soft hover:shadow-soft-lg transition-all duration-300': {},
        },

        // Navigation Professional
        '.nav-professional': {
          '@apply bg-white/95 dark:bg-[#0C3C4A]/95 backdrop-blur-sm border-b border-[#E6E6E0] dark:border-white/10': {},
        },

        // Heading Professional
        '.heading-professional': {
          '@apply text-[#124F62] dark:text-white tracking-wide': {},
          fontFamily: '"EB Garamond", serif',
        },

        // Status badges
        '.badge-funded': {
          '@apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': {},
          '@apply px-3 py-1 rounded-full text-xs font-light uppercase tracking-wider': {},
        },
        '.badge-active': {
          '@apply bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': {},
          '@apply px-3 py-1 rounded-full text-xs font-light uppercase tracking-wider': {},
        },
        '.badge-draft': {
          '@apply bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400': {},
          '@apply px-3 py-1 rounded-full text-xs font-light uppercase tracking-wider': {},
        },
      })
    }
  ],
}