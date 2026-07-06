/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan':   '#00d4ff',
        'electric-purple': '#7b2fff',
        'hot-pink':    '#ff0080',
        'deep-black':  '#050508',
        'dark-grey':   '#0d0d15',
        'neon-gold':   '#d9a619',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
