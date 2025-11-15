export const colors = {
  "brand": {
    "50": "#eef2ff",
    "100": "#e0e7ff",
    "200": "#c7d2fe",
    "300": "#a5b4fc",
    "400": "#818cf8",
    "500": "#6366f1",
    "600": "#4f46e5",
    "700": "#4338ca",
    "800": "#312e81",
    "900": "#1e1b4b"
  },
  "neutral": {
    "25": "#0f172a",
    "50": "#111827",
    "100": "#1f2937",
    "200": "#374151",
    "300": "#4b5563",
    "400": "#9ca3af",
    "500": "#d1d5db",
    "600": "#e5e7eb",
    "700": "#f3f4f6",
    "800": "#f9fafb"
  },
  "surface": "#ffffff",
  "surfaceMuted": "#f8fafc",
  "success": "#22c55e",
  "warning": "#f97316",
  "danger": "#ef4444"
} as const;

export const spacing = {
  "xs": 4,
  "sm": 8,
  "md": 12,
  "lg": 16,
  "xl": 20,
  "2xl": 24
} as const;

export const typography = {
  "heading": {
    "fontFamily": "PlayfairDisplay_700Bold",
    "fontSize": 28,
    "lineHeight": 34
  },
  "body": {
    "fontFamily": "Inter_400Regular",
    "fontSize": 16,
    "lineHeight": 24
  },
  "label": {
    "fontFamily": "Inter_600SemiBold",
    "fontSize": 14,
    "lineHeight": 18
  }
} as const;

export const radii = {
  "sm": 8,
  "md": 16,
  "lg": 24,
  "xl": 32
} as const;

export const shadows = {
  "card": {
    "shadowColor": "#0f172a",
    "shadowOpacity": 0.12,
    "shadowOffset": {
      "width": 0,
      "height": 12
    },
    "shadowRadius": 24,
    "elevation": 8
  }
} as const;

export type ColorScale = typeof colors;
export type SpacingScale = typeof spacing;
export type TypographyScale = typeof typography;
export type RadiiScale = typeof radii;
export type ShadowScale = typeof shadows;

