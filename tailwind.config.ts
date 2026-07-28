import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1B2B4B',
        orange: '#E8533A',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        purpleTag: '#8B5CF6',
        appBg: '#F4F6F9',
        borderSoft: '#E2E8F0',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} satisfies Config;
