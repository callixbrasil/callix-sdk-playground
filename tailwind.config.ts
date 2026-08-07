import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cx: {
          bg: '#080f11',
          panel: '#0f1a1d',
          raised: '#152528',
          line: '#1d3136',
          line2: '#2a474d',
          text: '#e8f1f0',
          muted: '#93a9aa',
          dim: '#67807f',
          teal: '#2fd4c4',
          tealdim: '#146d68',
        },
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -12px rgba(0,0,0,0.8)',
        glow: '0 0 0 1px rgba(47,212,196,0.35), 0 0 28px -6px rgba(47,212,196,0.45)',
      },
      keyframes: {
        ring: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(2.1)', opacity: '0' },
        },
        blip: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        slidein: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        ring: 'ring 1.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        blip: 'blip 1.4s ease-in-out infinite',
        slidein: 'slidein 180ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
