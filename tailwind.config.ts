import type { Config } from "tailwindcss";

// Palette note: deliberately avoids party colours. Canadian parties own red,
// blue, orange and green, and a civic comparison site that leans on any of
// them reads as taking a side before a visitor has read a word.
// Slate + a muted teal accent belong to nobody.

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1a2332", // 15.8:1 on white, 15.0:1 on paper-warm
          soft: "#3d4a5c", //    9.0:1 on white,  8.6:1 on paper-warm
          // Was #6b7787, which measured 4.55:1 on white — nominally a pass —
          // but only 4.33:1 on paper-warm, which is the BODY background and
          // every other row of the comparison table. It failed WCAG 1.4.3 on
          // most of the site, and it is the colour used for every source
          // line, date and extent note: the checkable evidence, in the one
          // shade hardest to read. Darkened to 5.0:1 on warm, 5.3:1 on white.
          faint: "#616d7c",
        },
        accent: {
          DEFAULT: "#0f5c63",
          hover: "#0b4a50",
          light: "#e6f1f2",
        },
        paper: {
          DEFAULT: "#ffffff",
          warm: "#faf9f7",
          edge: "#e6e3de",
        },
        flag: {
          DEFAULT: "#8a5a00",
          light: "#fdf4e3",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
