import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchArguments, ArgumentListItem } from '../api/arguments';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';

const PAGE_SIZE = 20;

export default function ArgumentsScreen() {
  const [items, setItems] = useState<ArgumentListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const loadPage = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetchArguments({
        limit: PAGE_SIZE,
        offset: reset ? 0 : offset,
      });
      setItems((prev) => (reset ? response : [...prev, ...response]));
      setOffset((prev) => (reset ? response.length : prev + response.length));
      setHasMore(response.length === PAGE_SIZE);
    } catch (error) {
      console.log('Failed to load arguments', error);
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
          <Text style={styles.heroTitle}>Stay ahead of friction</Text>
          <Text style={styles.heroSubtitle}>
            Track open arguments, respond to new perspectives, and keep momentum with quick follow-ups.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.card}
          onPress={() => router.push({ pathname: '/argument', params: { id: item.id } })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={[styles.priorityPill, getPriorityStyle(item.priority)]}>
              <Text style={[styles.priorityText, getPriorityTextStyle(item.priority)]}>{item.priority}</Text>
            </View>
          </View>
          <Text style={styles.meta}>Status: {item.status}</Text>
          <Text style={styles.meta}>Category: {item.category}</Text>
          <Text style={styles.meta}>Created: {item.created_at}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        !loading ? (
          <Text style={styles.empty}>No arguments logged yet. Start one to invite both perspectives.</Text>
        ) : null
      }
      ListFooterComponent={
        loading && hasMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color={colors.brand[500]} />
          </View>
        ) : null
      }
      onEndReached={() => {
        if (hasMore && !loading) {
          loadPage();
        }
      }}
      refreshControl={
        <RefreshControl tintColor={colors.brand[500]} refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const PRIORITY_MAP: Record<string, { background: string; text: string }> = {
  urgent: { background: '#fee2e2', text: '#b91c1c' },
  high: { background: '#ffedd5', text: '#c2410c' },
  medium: { background: '#dbeafe', text: '#1d4ed8' },
  low: { background: '#e2e8f0', text: '#1f2937' },
};

function getPriorityStyle(priority: string) {
  const preset = PRIORITY_MAP[priority] ?? PRIORITY_MAP.low;
  return {
    backgroundColor: preset.background,
  };
}

function getPriorityTextStyle(priority: string) {
  const preset = PRIORITY_MAP[priority] ?? PRIORITY_MAP.low;
  return {
    color: preset.text,
  };
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.md,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.body.fontSize + 6,
    fontWeight: '700',
    color: colors.neutral[100],
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    color: colors.neutral[400],
    lineHeight: 20,
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
  priorityPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
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

