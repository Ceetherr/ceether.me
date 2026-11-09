export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "#f6f1e7",
        cardBg: "#efeae0",
        ink: "#2a2622",
        mutedInk: "#686056",
        terracotta: "#9a3c28",
        terracottaHover: "#b4452f",
        borderSubtle: "#d6d0c4",
      },
      fontFamily: {
        sans: ['Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Markazi Text', 'Amiri', 'Traditional Arabic', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'serif-persian': ['Markazi Text', 'Amiri', 'Traditional Arabic', 'serif'],
        'body-persian': ['Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
