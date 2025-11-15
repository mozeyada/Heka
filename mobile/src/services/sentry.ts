import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

let isRegistered = false;

export function registerSentry() {
  if (isRegistered) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';
  if (!dsn) return;
  Sentry.init({
    dsn,
    debug: __DEV__,
    tracesSampleRate: 1.0,
    release: `${Constants?.expoConfig?.name}@${Constants?.expoConfig?.version}-${Constants?.expoConfig?.runtimeVersion ?? 'native'}`,
  });
  isRegistered = true;
}

