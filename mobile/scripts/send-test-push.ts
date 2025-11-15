import { Expo, ExpoPushMessage } from 'expo-server-sdk';

function usage() {
  console.log('Usage: npm run push:test -- <ExpoPushToken>');
  console.log('Environment variables:');
  console.log('  EXPO_ACCESS_TOKEN (optional) – Expo access token with push:send scope.');
  console.log('  PUSH_MESSAGE_TITLE (optional) – overrides default title.');
  console.log('  PUSH_MESSAGE_BODY (optional) – overrides default body.');
}

async function main() {
  const [, , token] = process.argv;

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  if (!token) {
    console.error('Error: Expo push token is required.');
    usage();
    process.exit(1);
  }

  const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
  });

  if (!Expo.isExpoPushToken(token)) {
    console.error(`Error: ${token} is not a valid Expo push token.`);
    process.exit(1);
  }

  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title: process.env.PUSH_MESSAGE_TITLE ?? 'Heka push smoke test',
    body:
      process.env.PUSH_MESSAGE_BODY ??
      'This is a test notification triggered from scripts/send-test-push.ts',
    data: {
      smokeTest: true,
      sentAt: new Date().toISOString(),
    },
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket) => {
        if (ticket.status === 'ok') {
          console.log(`Push ticket OK: ${ticket.id ?? '(no id)'}`);
        } else {
          console.error('Push ticket error:', ticket);
        }
      });
    }

    console.log('Push smoke test request sent. Check device for delivery.');
  } catch (error) {
    console.error('Failed to send push test:', error);
    process.exit(1);
  }
}

main();



