import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchCheckinHistory, CheckinHistoryItem } from '../api/checkins';
import { colors, spacing, radii, typography, shadows } from '../theme/tokens';

const PAGE_SIZE = 10;

export default function CheckinsScreen() {
  const [items, setItems] = useState<CheckinHistoryItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const router = useRouter();

  const loadPage = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetchCheckinHistory({
        limit: PAGE_SIZE,
        offset: reset ? 0 : offset,
      });
      setItems((prev) => (reset ? response.checkins : [...prev, ...response.checkins]));
      setOffset((prev) => (reset ? response.checkins.length : prev + response.checkins.length));
      setNextOffset(response.next_offset);
    } catch (error) {
      console.log('Failed to load check-ins', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPage(true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadPage(true);
  }, []);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Weekly check-ins</Text>
          <Text style={styles.heroSubtitle}>
            Stay aligned with a five-minute ritual. Tap a week to review completion details on the dashboard.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.card}
          onPress={() => router.push('/dashboard')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Week beginning {item.week_start_date}</Text>
            <View style={[styles.statusPill, item.status === 'completed' ? styles.statusComplete : styles.statusPending]}>
              <Text
                style={[styles.statusText, item.status === 'completed' ? styles.statusTextComplete : styles.statusTextPending]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          {item.completed_at ? (
            <Text style={styles.meta}>Completed: {item.completed_at}</Text>
          ) : (
            <Text style={styles.meta}>Not completed yet</Text>
          )}
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        !loading ? (
          <Text style={styles.empty}>No history yet. Complete your first weekly check-in to begin tracking.</Text>
        ) : null
      }
      ListFooterComponent={
        loading && nextOffset !== null ? (
          <View style={styles.footer}>
            <ActivityIndicator color={colors.brand[500]} />
          </View>
        ) : null
      }
      onEndReached={() => {
        if (nextOffset !== null && !loading) {
          loadPage();
        }
      }}
      refreshControl={
        <RefreshControl tintColor={colors.brand[500]} refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.md,
  },
  hero: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.body.fontSize + 6,
    fontWeight: '700',
    color: colors.neutral[100],
  },
  heroSubtitle: {
    color: colors.neutral[400],
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.brand[500],
  },
  ctaButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.neutral[100],
    fontSize: typography.body.fontSize + 2,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.md,
  },
  meta: {
    color: colors.neutral[400],
    fontSize: 14,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  statusPending: {
    backgroundColor: '#fef9c3',
  },
  statusComplete: {
    backgroundColor: '#bbf7d0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statusTextPending: {
    color: '#b45309',
  },
  statusTextComplete: {
    color: '#15803d',
  },
  empty: {
    textAlign: 'center',
    color: colors.neutral[400],
    paddingVertical: spacing['2xl'],
  },
  footer: {
    paddingVertical: spacing.md,
  },
});

