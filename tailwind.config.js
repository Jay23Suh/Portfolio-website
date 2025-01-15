module.exports = {
  theme: {
    extend: {
      fontFamily: {
        patrick: ['"Patrick Hand SC"', 'cursive'], // Patrick Hand SC
        beezee: ['"ABeeZee"', 'sans-serif'],
        edu: ['"Edu AU VIC WA NT Arrows"', 'cursive'], // Edu Arrows Font
      },
      colors: {
        navy: '#22598f', // Adjust this if you want a custom shade of navy
        navyDark: '#0a1d34', // An even darker shade for gradient stop
        orange: '#ffb01f', // Custom orange shade
      },
      keyframes: {
        colorCycle: {
          '0%': { color: '#a855f7' }, // Purple
          '25%': { color: '#14b8a6' }, // Teal
          '50%': { color: '#84cc16' }, // Lime
          '75%': { color: '#6366f1' }, // Indigo
          '100%': { color: '#0ea5e9' }, // Cyan
        },
      },
      animation: {
        colorCycle: 'colorCycle 4s infinite',
      },
    },
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [],
};
