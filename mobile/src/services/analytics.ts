import { NativeModules } from 'react-native';

type MixpanelStatic = typeof import('mixpanel-react-native')['Mixpanel'];

let mixpanelModule: MixpanelStatic | null | undefined;
let instance: any = null;
let supported: boolean | null = null;

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[Mixpanel] ${message}`, meta ?? {});
  }
}

function loadMixpanel() {
  if (mixpanelModule !== undefined) {
    return mixpanelModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('mixpanel-react-native') as {
      Mixpanel?: MixpanelStatic;
    };
    mixpanelModule = pkg?.Mixpanel ?? null;
  } catch (error) {
    logDebug('Failed to load mixpanel-react-native package', { error });
    mixpanelModule = null;
  }

  return mixpanelModule;
}

function isMixpanelSupported() {
  if (supported !== null) return supported;
  supported = Boolean(NativeModules?.MixpanelReactNative);
  if (!supported) {
    logDebug('Native module unavailable – skipping Mixpanel init');
  }
  return supported;
}

export async function initializeMixpanel() {
  if (instance) return instance;
  if (!isMixpanelSupported()) {
    return null;
  }
  const Mixpanel = loadMixpanel();
  if (!Mixpanel) {
    return null;
  }
  const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    logDebug('Token missing, analytics disabled');
    return null;
  }
  try {
    const client = await Mixpanel.init(token, true);
    if (__DEV__) {
      client.setLoggingEnabled(true);
    }
    instance = client;
    return instance;
  } catch (error) {
    logDebug('Mixpanel init failed', { error });
    return null;
  }
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


