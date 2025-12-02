import { Stack, useLocalSearchParams } from 'expo-router';
import ArgumentDetailScreen from '../../src/screens/ArgumentDetailScreen';

export default function ArgumentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ArgumentDetailScreen argumentId={id} />
    </>
  );
}



