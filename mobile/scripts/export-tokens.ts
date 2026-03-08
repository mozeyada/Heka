/**
 * Temporary script to stub Tailwind tokens for React Native until an automated exporter is wired up.
 * In future iterations this will read from frontend/tailwind.config.ts and globals.css.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const tokens = {
  colors: {
    brand: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
    neutral: {
      25: "#f9fafb",
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    surface: "#ffffff",
    surfaceMuted: "#f8fafc",
    success: "#22c55e",
    warning: "#f97316",
    danger: "#ef4444",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
  },
  typography: {
    heading: {
      fontFamily: "PlayfairDisplay_700Bold",
      fontSize: 28,
      lineHeight: 34,
    },
    body: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      lineHeight: 24,
    },
    label: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      lineHeight: 18,
    },
  },
  radii: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadows: {
    card: {
      shadowColor: "#0f172a",
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

const target = resolve(__dirname, "../src/theme/tokens.ts");
const fileContents = `export const colors = ${JSON.stringify(tokens.colors, null, 2)} as const;

export const gradients = {
  brand: [\"#eef2ff\", \"#ffffff\"],
  hero: [\"#e0e7ff\", \"#f8fafc\"],
  glass: [\"rgba(255, 255, 255, 0.7)\", \"rgba(255, 255, 255, 0.3)\"],
} as const;

export const glass = {
  intensity: 80,
  tint: \"light\",
  opacity: 0.85,
} as const;

export const spacing = ${JSON.stringify(tokens.spacing, null, 2)} as const;

export const typography = ${JSON.stringify(tokens.typography, null, 2)} as const;

export const radii = ${JSON.stringify(tokens.radii, null, 2)} as const;

export const shadows = {
  ...${JSON.stringify(tokens.shadows, null, 2)},
  soft: {
    shadowColor: \"#4f46e5\",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  }
} as const;

export type ColorScale = typeof colors;
export type SpacingScale = typeof spacing;
export type TypographyScale = typeof typography;
export type RadiiScale = typeof radii;
export type ShadowScale = typeof shadows;
`;

writeFileSync(target, fileContents);
console.log("Design tokens exported to src/theme/tokens.ts");
