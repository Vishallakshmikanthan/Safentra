import type { Config } from 'tailwindcss'

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline-variant": "#c6c7c1",
        "surface-container": "#f1edec",
        "background": "#fcf8f7",
        "surface-variant": "#e5e2e1",
        "inverse-surface": "#313030",
        "primary-container": "#1c1d1b",
        "secondary-container": "#fdb244",
        "inverse-on-surface": "#f4f0ef",
        "primary-fixed": "#e4e2df",
        "error": "#ba1a1a",
        "secondary": "#835400",
        "surface": "#fcf8f7",
        "on-secondary": "#ffffff",
        "on-primary-container": "#858582",
        "tertiary-fixed-dim": "#bdc8d3",
        "outline": "#767872",
        "on-tertiary": "#ffffff",
        "primary-fixed-dim": "#c7c6c3",
        "surface-dim": "#ddd9d8",
        "on-surface": "#1c1b1b",
        "on-error-container": "#93000a",
        "on-primary": "#ffffff",
        "on-tertiary-fixed-variant": "#3e4851",
        "inverse-primary": "#c7c6c3",
        "secondary-fixed-dim": "#ffb956",
        "on-tertiary-container": "#7c8691",
        "secondary-fixed": "#ffddb5",
        "on-secondary-container": "#6e4600",
        "on-surface-variant": "#454743",
        "surface-bright": "#fcf8f7",
        "primary": "#020202",
        "tertiary-container": "#141e26",
        "on-secondary-fixed": "#2a1800",
        "on-primary-fixed-variant": "#464744",
        "surface-container-low": "#f7f3f2",
        "on-secondary-fixed-variant": "#633f00",
        "on-tertiary-fixed": "#131d25",
        "tertiary-fixed": "#d9e4ef",
        "surface-tint": "#5e5e5c",
        "on-error": "#ffffff",
        "surface-container-highest": "#e5e2e1",
        "on-background": "#1c1b1b",
        "tertiary": "#000307",
        "error-container": "#ffdad6",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#ebe7e6",
        "on-primary-fixed": "#1b1c1a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "panel-padding": "24px",
        "unit": "4px",
        "margin-mobile": "16px",
        "gutter": "16px",
        "margin-desktop": "32px"
      },
      fontFamily: {
        "body-sm": ["IBM Plex Sans"],
        "display-lg": ["Archivo Narrow"],
        "label-caps": ["Archivo Narrow"],
        "headline-lg": ["Archivo Narrow"],
        "data-lg": ["IBM Plex Mono"],
        "body-lg": ["IBM Plex Sans"],
        "headline-md": ["Archivo Narrow"],
        "data-md": ["IBM Plex Mono"],
        "body-md": ["IBM Plex Sans"]
      },
      fontSize: {
        "body-sm": ["14px", { "lineHeight": "1.4", "fontWeight": "400" }],
        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.08em", "fontWeight": "700" }],
        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600" }],
        "data-lg": ["18px", { "lineHeight": "1.2", "fontWeight": "500" }],
        "body-lg": ["18px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "600" }],
        "data-md": ["14px", { "lineHeight": "1.2", "fontWeight": "500" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }]
      }
    }
  },
  plugins: [],
} satisfies Config
