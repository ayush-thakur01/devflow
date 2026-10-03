import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Satoshi', 'Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.0125em', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '600' }],
        'h5': ['1rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '600' }],
        'h6': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.65', letterSpacing: '0em' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0em' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.005em' }],
        'label': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.08em', fontWeight: '600' }],
        'tiny': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      colors: {
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#00ff88',
          500: '#00e67a',
          600: '#00cc6a',
          700: '#00994f',
          800: '#006635',
          900: '#00331a',
          950: '#001a0d',
        },
        premium: {
          950: '#080B12',
          900: '#0E1422',
          850: '#151D2E',
          800: '#1A1F2E',
          700: '#232946',
          600: '#2D3558',
          500: '#4A5586',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        cyan: {
          400: '#00ff88',
          500: '#00e67a',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.02)',
        'soft-lg': '0 8px 40px -8px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.02)',
        'elevated': '0 0 0 1px rgba(255,255,255,0.03), 0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.15)',
        'card': '0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 0 0 1px rgba(0,255,136,0.12), 0 4px 12px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.15)',
        'premium': '0 0 0 1px rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        'premium-hover': '0 0 0 1px rgba(0,255,136,0.15), 0 4px 16px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.18), 0 24px 60px rgba(0,0,0,0.12)',
        'glow': '0 0 30px rgba(0,255,136,0.08), 0 0 60px rgba(0,255,136,0.04)',
        'glow-indigo': '0 0 30px rgba(99,102,241,0.08), 0 0 60px rgba(99,102,241,0.04)',
        'glow-amber': '0 0 30px rgba(245,158,11,0.08), 0 0 60px rgba(245,158,11,0.04)',
        'modal': '0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.4), 0 40px 120px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'aurora-slow': {
          '0%, 100%': { transform: 'translateX(0%) translateY(0%) rotate(0deg)', opacity: '0.5' },
          '25%': { transform: 'translateX(5%) translateY(-3%) rotate(3deg)', opacity: '0.6' },
          '50%': { transform: 'translateX(-3%) translateY(2%) rotate(-2deg)', opacity: '0.4' },
          '75%': { transform: 'translateX(3%) translateY(-1%) rotate(1deg)', opacity: '0.55' },
        },
        'aurora-medium': {
          '0%, 100%': { transform: 'translateX(0%) translateY(0%) scale(1)', opacity: '0.35' },
          '33%': { transform: 'translateX(-4%) translateY(3%) scale(1.05)', opacity: '0.45' },
          '66%': { transform: 'translateX(3%) translateY(-2%) scale(0.95)', opacity: '0.3' },
        },
        'aurora-fast': {
          '0%, 100%': { transform: 'translateX(0%) translateY(0%) scale(1.02)', opacity: '0.2' },
          '50%': { transform: 'translateX(2%) translateY(1%) scale(0.98)', opacity: '0.3' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(1%, -1%)' },
          '50%': { transform: 'translate(-0.5%, 0.5%)' },
          '75%': { transform: 'translate(0.5%, -0.5%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'aurora-slow': 'aurora-slow 12s ease-in-out infinite',
        'aurora-medium': 'aurora-medium 8s ease-in-out infinite',
        'aurora-fast': 'aurora-fast 5s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'drift': 'drift 20s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      backgroundImage: {
        'mesh': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    typography({
      className: 'prose',
      target: 'modern',
      css: {
        'h1, h2, h3, h4, h5, h6': {
          fontFamily: "'Satoshi', 'Manrope', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontWeight: '600',
        },
      },
    }),
  ],
}
