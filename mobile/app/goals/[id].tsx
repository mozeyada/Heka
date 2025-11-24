import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/theme/tokens';

export default function GoalDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // TODO: Implement goal detail screen
  // For now, show placeholder
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.text}>Goal Detail: {id}</Text>
        <Text style={styles.note}>This screen needs to be implemented.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.neutral[100],
    marginBottom: spacing.md,
  },
  note: {
    fontSize: 14,
    color: colors.neutral[400],
  },
});

