export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['BCGHenSans', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Agrega aquí tus colores personalizados
        edgeText: "#323232",
        edgeTextSecondary: "#989898",
        edgeBorder: "#474747",
        edgeBackground: "#F1EEEA",
        edgeGreen: "#21BF61",
      },
    },
  },
  plugins: [],
};
