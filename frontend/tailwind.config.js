/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0E17',
          surface: '#111827',
          surfaceHover: '#162238',
          border: '#1E293B',
          accent: '#2563EB',
          accentCyan: '#0EA5E9',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          textPrimary: '#F1F5F9',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
