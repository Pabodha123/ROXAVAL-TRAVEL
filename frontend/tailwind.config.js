
export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        forest: '#0f3d2e',
        emerald: {
          DEFAULT: '#1a7a5e',
          light: '#2a9d78',
        },
        gold: {
          DEFAULT: '#c8a24c',
          light: '#dbbb6f',
        },
        cream: '#f6f1e7',
        sand: '#efe6d6',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 50px -20px rgba(15, 61, 46, 0.25)',
        lift: '0 30px 70px -25px rgba(15, 61, 46, 0.35)',
      },
    },
  },
}
