/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Este patrón es más robusto y asegura que se escaneen todos los archivos
    // en el directorio raíz y en todas las subcarpetas como 'pages' y 'components'.
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0D47A1',
        'brand-secondary': '#1976D2',
        'brand-light': '#BBDEFB',
        'accent': '#FFC107',
      },
    },
  },
  plugins: [],
}