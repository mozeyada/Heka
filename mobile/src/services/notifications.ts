import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerDeviceToken, revokeDeviceToken } from '../api/notifications';
import { getDeviceId } from './deviceId';
import { trackEvent } from './analytics';

let registrationAttempted = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4F46E5',
  });
}

export async function registerForPushNotifications() {
  if (registrationAttempted) return;
  registrationAttempted = true;

  try {
    if (!Device.isDevice) {
      await trackEvent('push_registration_skipped', { reason: 'simulator' });
      registrationAttempted = false;
      return;
    }

    await ensureAndroidChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      await trackEvent('push_registration_failed', { reason: 'permission_denied' });
      registrationAttempted = false;
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    const token = tokenResponse.data;
    const deviceId = await getDeviceId();

    await registerDeviceToken({
      device_id: deviceId,
      platform: Platform.OS,
      token,
    });

    await trackEvent('push_registration_success', {
      platform: Platform.OS,
    });
  } catch (error) {
    await trackEvent('push_registration_failed', { reason: 'exception' });
    registrationAttempted = false;
    throw error;
  }
}

export async function unregisterPushNotifications() {
  try {
    if (!Device.isDevice) return;
    const deviceId = await getDeviceId();
    await revokeDeviceToken(deviceId);
    await trackEvent('push_registration_revoked');
  } catch (error) {
    await trackEvent('push_registration_revoke_failed');
  } finally {
    registrationAttempted = false;
  }
}

