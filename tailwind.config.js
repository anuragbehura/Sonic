/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0A0A0A",
          elevated: "#121212",
          card: "#1C1C1E",
        },

        text: {
          primary: "#FFFFFF",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },

        accent: {
          DEFAULT: "#1DB954",
          hover: "#1ED760",
        },

        border: "#2D2D2D",
      },

      spacing: {
        touch: "60px",
        "touch-lg": "72px",
      },

      borderRadius: {
        card: "12px",
        "card-lg": "16px",
        pill: "9999px",
      },

      fontSize: {
        display: [
          "40px",
          {
            lineHeight: "1.1",
            fontWeight: "700",
          },
        ],

        "title-lg": [
          "24px",
          {
            lineHeight: "1.2",
            fontWeight: "700",
          },
        ],

        title: [
          "20px",
          {
            lineHeight: "1.3",
            fontWeight: "600",
          },
        ],

        body: [
          "16px",
          {
            lineHeight: "1.5",
          },
        ],

        caption: [
          "14px",
          {
            lineHeight: "1.4",
          },
        ],

        "caption-sm": [
          "12px",
          {
            lineHeight: "1.4",
          },
        ],
      },

      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },

  plugins: [],
};
