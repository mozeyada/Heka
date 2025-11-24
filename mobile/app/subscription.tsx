import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../src/theme/tokens';
import { Card } from '../src/components/common';
import { PageHeading } from '../src/components/PageHeading';

export default function SubscriptionRoute() {
  // TODO: Implement subscription screen
  // For now, show placeholder
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <PageHeading
          title="Subscription"
          description="Manage your subscription and usage"
        />
        <Card>
          <Text style={styles.text}>Subscription management coming soon.</Text>
          <Text style={styles.note}>
            This screen needs to be fully implemented with subscription tiers, usage stats, and billing management.
          </Text>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  text: {
    ...typography.body,
    color: colors.neutral[100],
    marginBottom: spacing.md,
  },
  note: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
  },
});

