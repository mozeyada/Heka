import { Mixpanel } from 'mixpanel-react-native';

let instance: Mixpanel | null = null;

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[Mixpanel] ${message}`, meta ?? {});
  }
}

export async function initializeMixpanel() {
  if (instance) return instance;
  const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    logDebug('Token missing, analytics disabled');
    return null;
  }
  const client = await Mixpanel.init(token, true);
  if (__DEV__) {
    client.setLoggingEnabled(true);
  }
  instance = client;
  return instance;
}

async function getMixpanel() {
  if (!instance) {
    await initializeMixpanel();
  }
  return instance;
}

export async function identifyUser(userId: string) {
  const mp = await getMixpanel();
  if (!mp) return;
  logDebug('identifyUser', { userId });
  await mp.identify(userId);
}

export async function trackEvent(event: string, props?: Record<string, unknown>) {
  const mp = await getMixpanel();
  logDebug('trackEvent', { event, props });
  await mp?.track(event, props);
}


