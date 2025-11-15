import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'heka:device-id';

export async function getDeviceId() {
  let deviceId = await AsyncStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await AsyncStorage.setItem(STORAGE_KEY, deviceId);
  }
  return deviceId;
}

