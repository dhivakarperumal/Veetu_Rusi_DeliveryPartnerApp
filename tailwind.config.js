/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          darkGreen: '#304B26',
          brandGreen: '#217032',
          lightGreen: '#EBF7EB',
          oliveGreen: '#8FA759',
          mutedGreen: '#A1C9A1',
        },
        accent: {
          darkBrown: '#782D16',
          brown: '#8D4925',
          orange: '#AF6333',
          golden: '#DC9441',
        },
        background: {
          main: '#F9F9F9',
          card: '#FFFFFF',
          beige: '#FBF4E7',
          lightBeige: '#FDF6E7',
          darkBeige: '#F4E3C5',
          map: '#F0F2ED',
        },
        status: {
          success: '#217032',
          error: '#D32F2F',
          errorLight: '#FDEAEA',
        }
      }
    },
  },
  plugins: [],
}