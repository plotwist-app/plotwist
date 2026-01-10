/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./{app,components}/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          foreground:
            "rgb(var(--color-destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
          foreground: "rgb(var(--color-card-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        "space-grotesk": ["SpaceGrotesk_400Regular"],
        "space-grotesk-medium": ["SpaceGrotesk_500Medium"],
        "space-grotesk-semibold": ["SpaceGrotesk_600SemiBold"],
        "space-grotesk-bold": ["SpaceGrotesk_700Bold"],
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ":root": {
          // Dark theme colors (RGB values)
          "--color-background": "9 9 11", // #09090b
          "--color-foreground": "250 250 250", // #fafafa
          "--color-primary": "250 250 250", // #fafafa
          "--color-primary-foreground": "24 24 27", // #18181b
          "--color-secondary": "39 39 42", // #27272a
          "--color-secondary-foreground": "250 250 250", // #fafafa
          "--color-muted": "39 39 42", // #27272a
          "--color-muted-foreground": "161 161 170", // #a1a1aa
          "--color-accent": "39 39 42", // #27272a
          "--color-accent-foreground": "250 250 250", // #fafafa
          "--color-destructive": "127 29 29", // #7f1d1d
          "--color-destructive-foreground": "250 250 250", // #fafafa
          "--color-border": "39 39 42", // #27272a
          "--color-input": "39 39 42", // #27272a
          "--color-ring": "212 212 216", // #d4d4d8
          "--color-card": "9 9 11", // #09090b
          "--color-card-foreground": "250 250 250", // #fafafa
        },
      });
    }),
  ],
};
