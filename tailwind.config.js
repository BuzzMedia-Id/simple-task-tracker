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
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
        },
        gray: {
          300: '#D1D5DB',
          500: '#6B7280',
          600: '#6B7280',
        },
        success: '#10B981',
        error: '#EF4444',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      boxShadow: {
        'focus': '0 0 0 2px #2563EB, 0 0 0 4px rgba(37, 99, 235, 0.1)',
        'focus-error': '0 0 0 2px #EF4444, 0 0 0 4px rgba(239, 68, 68, 0.1)',
      },
    },
  },
  plugins: [],
}