import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchArguments, Argument } from '../api/arguments';
import { useAuthStore } from '../store/auth';
import { colors, spacing, typography } from '../theme/tokens';
import { PageHeading } from '../components/PageHeading';
import { ArgumentCard } from '../components/ArgumentCard';

export default function ArgumentsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [args, setArgs] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArguments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArguments();
      setArgs(data);
    } catch (err) {
      setError('Failed to load arguments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadArguments();
    }
  }, [isAuthenticated, router, loadArguments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadArguments().finally(() => setRefreshing(false));
  }, [loadArguments]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <PageHeading
        title="Arguments"
        description="Track and manage your arguments."
        actions={
          <TouchableOpacity style={styles.button} onPress={() => router.push('/arguments/create')}>
            <Text style={styles.buttonText}>New Argument</Text>
          </TouchableOpacity>
        }
      />

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {args.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No arguments yet. Create one to get started!</Text>
        </View>
      )}

      {args.map((arg) => (
        <ArgumentCard
          key={arg.id}
          argument={arg}
          onPress={() => router.push(`/argument?id=${arg.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    padding: spacing.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  button: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.danger,
    borderWidth: 1,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});