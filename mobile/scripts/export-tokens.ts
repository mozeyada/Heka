/**
 * Temporary script to stub Tailwind tokens for React Native until an automated exporter is wired up.
 * In future iterations this will read from frontend/tailwind.config.ts and globals.css.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const tokens = {
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#312e81',
      900: '#1e1b4b',
    },
    neutral: {
      25: '#0f172a',
      50: '#111827',
      100: '#1f2937',
      200: '#374151',
      300: '#4b5563',
      400: '#9ca3af',
      500: '#d1d5db',
      600: '#e5e7eb',
      700: '#f3f4f6',
      800: '#f9fafb',
    },
    success: '#22c55e',
    warning: '#f97316',
    danger: '#ef4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  typography: {
    heading: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 28,
      lineHeight: 34,
    },
    body: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
    },
    label: {
      fontFamily: 'Inter_600SemiBold',
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
      shadowColor: '#0f172a',
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 24,
      elevation: 8,
    },
  },
} as const;

const target = resolve(__dirname, '../src/theme/tokens.ts');
const fileContents = `export const colors = ${JSON.stringify(tokens.colors, null, 2)} as const;

export const spacing = ${JSON.stringify(tokens.spacing, null, 2)} as const;

export const typography = ${JSON.stringify(tokens.typography, null, 2)} as const;

export const radii = ${JSON.stringify(tokens.radii, null, 2)} as const;

export const shadows = ${JSON.stringify(tokens.shadows, null, 2)} as const;
`;

writeFileSync(target, fileContents);
console.log('Design tokens exported to src/theme/tokens.ts');


