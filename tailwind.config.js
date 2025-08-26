// /** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'noticia': ['"Noticia Text"', 'serif'],
        'Philosopher': ['"Philosopher"', 'sans- serif'],
        'lucida-bright-regular': ['"lucida-bright-regular"', 'sans-serif'],
        'raleway': ['"Raleway"', 'sans-serif'],
        'Cormorant Garamond': ['"Cormorant Garamond"', 'serif'],
        'Lobster Two': ['"Lobster Two"', 'cursive'],
        'Montserrat': ['"Montserrat"', 'sans-serif'],
        'Roboto': ['"Roboto"', 'sans-serif!important'],
        'Tanseek Modern': ['"Tanseek Modern Arabic"', 'Tanseek Modern Arabic Bold'],
        'AwanZaman Heavy': ['"AwanZaman Heavy"', 'AwanZaman Heavy'],
        'Poppins': ['"Poppins"', 'sans-serif'],
        'Outfit': ['"Outfit", sans-serif'],
        'Potua':['Potua'],
        'OpenSan': ['"Open Sans", "Roboto", "Arial", "sans-serif"'],
        'Lato': ['"Lato", serif'],
        'Jersy': ['"Jersey 25"']
      },
      screens: {
        'md150': '1650px',
        'md11': '1160px',
        'md77': '770px',
        'md36': '360px',  
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}