const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        patrick: ['"Patrick Hand SC"', 'cursive'],
        beezee: ['"ABeeZee"', 'sans-serif'],
        edu: ['"Edu AU VIC WA NT Arrows"', 'cursive'],
      },
      colors: {
        navy: '#22598f',
        navyDark: '#0a1d34',
        orange: '#ffb01f',
      },
      keyframes: {
        colorCycle: {
          '0%':   { color: '#a855f7' },
          '25%':  { color: '#14b8a6' },
          '50%':  { color: '#84cc16' },
          '75%':  { color: '#6366f1' },
          '100%': { color: '#0ea5e9' },
        },
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to:   { backgroundPosition: '350% 50%, 350% 50%' },
        },
        moveHorizontal: {
          '0%':   { transform: 'translateX(-50%) translateY(-10%)' },
          '50%':  { transform: 'translateX(50%) translateY(10%)' },
          '100%': { transform: 'translateX(-50%) translateY(-10%)' },
        },
        moveInCircle: {
          '0%':   { transform: 'rotate(0deg)' },
          '50%':  { transform: 'rotate(180deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        moveVertical: {
          '0%':   { transform: 'translateY(-50%)' },
          '50%':  { transform: 'translateY(50%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        colorCycle: 'colorCycle 4s infinite',
        aurora: 'aurora 60s linear infinite',
        first:  'moveVertical 30s ease infinite',
        second: 'moveInCircle 20s reverse infinite',
        third:  'moveInCircle 40s linear infinite',
        fourth: 'moveHorizontal 40s ease infinite',
        fifth:  'moveInCircle 20s ease infinite',
      },
    },
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }) {
  const allColors = flattenColorPalette(theme('colors'));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({ ':root': newVars });
}
