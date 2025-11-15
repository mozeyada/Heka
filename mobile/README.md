# Heka Mobile (React Native)

This workspace hosts the native clients for iOS and Android, built with React Native + Expo.

## Getting Started

```bash
cd mobile
npm install    # or yarn / pnpm
npm run start  # launch Expo dev server
```

- The app uses **expo-router**. Screens live under `app/`.
- Shared design tokens will be exported into `src/theme/tokens.ts`. For now a placeholder palette keeps parity with the web brand.
- The backend endpoints already support refresh tokens, dashboard overview, paginated arguments, goals, check-ins, and push-token registration.

## Next Steps

1. Regenerate Tailwind tokens (run `npm run export:tokens` after any web theme tweaks).
2. Execute push notification smoke tests (`npm run push:test -- <token>`) and tune permission copy (see `docs/QA_SMOKE_RUNBOOK.md`).
3. Validate analytics + error tracking dashboards before inviting beta cohort (`docs/QA_SMOKE_RUNBOOK.md`).
4. Use `eas build` (see `eas.json`) to generate internal test builds for the QA matrix.
5. Populate store metadata from `docs/BETA_COLLATERAL.md` once QA sign-off is complete.

## Environment Variables

Configure these (e.g., via `app.config.js` or `eas.json` secrets) before shipping beta builds:

- `EXPO_PUBLIC_MIXPANEL_TOKEN`
- `EXPO_PUBLIC_SENTRY_DSN`

