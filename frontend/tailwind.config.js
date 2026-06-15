/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        confidential: {
          DEFAULT: "#7C3AED",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        surface: "#050511",
        panel: "#0D0D1F",
      },
      borderRadius: {
        chip: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 2.5s infinite",
        glitch: "glitch 0.35s ease-in-out",
        "type-in": "type-in 0.2s ease-out forwards",
        "access-granted": "access-granted 0.5s ease-out forwards",
        "blink-cursor": "blink-cursor 1s step-end infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.75" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400% 0" },
          "100%": { backgroundPosition: "400% 0" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)", filter: "none" },
          "20%": { transform: "translate(-2px, 1px)", filter: "hue-rotate(90deg)" },
          "40%": { transform: "translate(2px, -1px)", filter: "hue-rotate(180deg)" },
          "60%": { transform: "translate(-1px, 0px)", filter: "saturate(200%)" },
          "80%": { transform: "translate(1px, 1px)", filter: "hue-rotate(270deg)" },
        },
        "type-in": {
          "0%": { opacity: "0", transform: "translateX(-6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "access-granted": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "60%": { opacity: "1", transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "blink-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
