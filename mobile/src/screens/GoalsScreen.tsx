import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchGoals, GoalListItem, updateGoalStatus } from '../api/goals';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';

const PAGE_SIZE = 20;

export default function GoalsScreen() {
  const [items, setItems] = useState<GoalListItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPage = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetchGoals({
        limit: PAGE_SIZE,
        offset: reset ? 0 : offset,
      });
      setItems((prev) => (reset ? response : [...prev, ...response]));
      setOffset((prev) => (reset ? response.length : prev + response.length));
      setHasMore(response.length === PAGE_SIZE);
    } catch (error) {
      console.log('Failed to load goals', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPage(true);
    setRefreshing(false);
  };

  const toggleGoalStatus = async (goal: GoalListItem) => {
    try {
      setUpdatingId(goal.id);
      const nextStatus = goal.status === 'completed' ? 'active' : 'completed';
      await updateGoalStatus(goal.id, nextStatus);
      setItems((prev) =>
        prev.map((item) => (item.id === goal.id ? { ...item, status: nextStatus } : item))
      );
    } catch (error) {
      console.log('Failed to update goal status', error);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadPage(true);
  }, []);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isCompleted = item.status === 'completed';
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title}</Text>
              <View style={[styles.statusPill, isCompleted ? styles.statusComplete : styles.statusActive]}>
                <Text style={[styles.statusText, isCompleted ? styles.statusTextComplete : styles.statusTextActive]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {item.target_date ? `Target: ${item.target_date}` : 'No target date set'}
            </Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            <TouchableOpacity
              style={[styles.actionButton, isCompleted ? styles.actionSecondary : styles.actionPrimary]}
              onPress={() => toggleGoalStatus(item)}
              disabled={updatingId === item.id}
            >
              <Text style={styles.actionButtonText}>
                {updatingId === item.id
                  ? 'Updating…'
                  : isCompleted
                  ? 'Mark Active'
                  : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={
        !loading ? <Text style={styles.empty}>No goals yet. Set an intention together.</Text> : null
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

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.neutral[100],
    fontSize: typography.body.fontSize + 2,
    fontWeight: '600',
  },
  meta: {
    color: colors.neutral[400],
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.neutral[600],
    fontSize: 14,
    lineHeight: 20,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  statusActive: {
    backgroundColor: colors.brand[100],
  },
  statusComplete: {
    backgroundColor: colors.neutral[600],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statusTextActive: {
    color: colors.brand[600],
  },
  statusTextComplete: {
    color: colors.neutral[50],
  },
  actionButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.brand[500],
  },
  actionSecondary: {
    backgroundColor: colors.neutral[600],
  },
  actionButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    color: colors.neutral[400],
    textAlign: 'center',
    paddingVertical: spacing['2xl'],
  },
  footer: {
    paddingVertical: spacing.md,
  },
});

