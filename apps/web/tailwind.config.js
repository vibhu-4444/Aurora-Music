/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serifDisplay: ["Instrument Serif", "serif"],
      },
      animation: {
        "fade-rise": "fadeRise 1100ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "float-slower": "floatSlow 13s ease-in-out infinite",
        "pulse-soft": "pulseSoft 5s ease-in-out infinite",
        "equalize-a": "equalize 1.8s ease-in-out infinite",
        "equalize-b": "equalize 2.25s ease-in-out infinite",
        "equalize-c": "equalize 1.55s ease-in-out infinite"
      },
      keyframes: {
        fadeRise: {
          "0%": { opacity: "0", transform: "translateY(18px)", filter: "blur(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(0, -18px, 0) rotate(1deg)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.32", transform: "scale(1)" },
          "50%": { opacity: "0.58", transform: "scale(1.04)" }
        },
        equalize: {
          "0%, 100%": { transform: "scaleY(0.32)" },
          "45%": { transform: "scaleY(1)" },
          "70%": { transform: "scaleY(0.54)" }
        }
      }
    },
  },
  plugins: [],
};
