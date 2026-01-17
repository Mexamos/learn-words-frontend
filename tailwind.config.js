module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Синхронизировано с Chakra UI breakpoints
      screens: {
        'sm': '480px',   // 30em - small devices
        'md': '768px',   // 48em - tablets
        'lg': '992px',   // 62em - desktops (custom для лучшего разделения)
        'xl': '1280px',  // 80em - large desktops
        '2xl': '1536px', // 96em - extra large desktops
      },
    }
  },
  plugins: [],
}