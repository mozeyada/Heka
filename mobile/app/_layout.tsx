import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../src/store/auth';
import { registerSentry } from '../src/services/sentry';
import { initializeMixpanel } from '../src/services/analytics';
import { registerForPushNotifications } from '../src/services/notifications';

const AUTHENTICATED_ROUTES = new Set(['dashboard', 'arguments', 'argument', 'goals', 'checkins']);

function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    registerSentry();
    void initializeMixpanel();
  }, []);

  useEffect(() => {
    if (accessToken) {
      registerForPushNotifications().catch((error) => {
        Sentry.captureException(error);
      });
    }
  }, [accessToken]);

  useEffect(() => {
    const current = segments[segments.length - 1];
    const inSecureArea = current ? AUTHENTICATED_ROUTES.has(current) : false;

    if (accessToken && !inSecureArea) {
      router.replace('/dashboard');
    }
    if (!accessToken && inSecureArea) {
      router.replace('/');
    }
  }, [accessToken, router, segments]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

