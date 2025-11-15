import { api } from './client';

type RegisterDevicePayload = {
  device_id: string;
  platform: string;
  token: string;
};

export async function registerDeviceToken(payload: RegisterDevicePayload) {
  await api.post('/api/notifications/device', payload);
}

export async function revokeDeviceToken(deviceId: string) {
  await api.delete(`/api/notifications/device/${deviceId}`);
}

