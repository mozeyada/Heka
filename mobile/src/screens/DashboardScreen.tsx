import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import { trackEvent } from '../services/analytics';
import { fetchDashboardOverview, DashboardOverview } from '../api/dashboard';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';
import { useAuthStore } from '../store/auth';

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { refreshSession } = useAuthStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const overview = await fetchDashboardOverview();
      setData(overview);
      await trackEvent('dashboard_loaded', {
        arguments_count: overview.arguments.length,
        goals_count: overview.goals.length,
        subscription_tier: overview.subscription.tier,
      });
    } catch (error) {
      console.log('Failed to load dashboard overview', error);
      Sentry.captureException(error);
      await trackEvent('dashboard_load_failed');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSession();
      const overview = await fetchDashboardOverview();
      setData(overview);
      await trackEvent('dashboard_refreshed');
    } catch (error) {
      console.log('Refresh failed', error);
      Sentry.captureException(error);
      await trackEvent('dashboard_refresh_failed');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void trackEvent('dashboard_viewed');
    void loadData();
  }, []);

  if (loading && !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loaderText}>Loading your dashboard…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl tintColor={colors.brand[500]} refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {data ? (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <Text style={styles.line}>
              Tier: <Text style={styles.highlight}>{data.subscription.tier}</Text>
            </Text>
            <Text style={styles.line}>Status: {data.subscription.status}</Text>
            {data.subscription.trial_end ? (
              <Text style={styles.line}>Trial ends: {data.subscription.trial_end}</Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage</Text>
            <Text style={styles.line}>
              {data.usage.count} / {data.usage.is_unlimited ? '∞' : data.usage.limit} arguments used
            </Text>
            <Text style={styles.line}>
              Period: {data.usage.period_start ?? '—'} → {data.usage.period_end ?? '—'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Check-in</Text>
            <Text style={styles.line}>Week starting: {data.week_start_date}</Text>
            <Text style={styles.line}>Status: {data.current_checkin?.status ?? 'pending'}</Text>
            {data.current_checkin?.completed_at ? (
              <Text style={styles.line}>Completed: {data.current_checkin.completed_at}</Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            {data.goals.length === 0 ? (
              <Text style={styles.line}>No active goals yet.</Text>
            ) : (
              data.goals.map((goal) => (
                <View key={goal.id} style={styles.item}>
                  <Text style={styles.itemTitle}>{goal.title}</Text>
                  <Text style={styles.itemMeta}>
                    Status: {goal.status} {goal.target_date ? `• Target: ${goal.target_date}` : ''}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Arguments</Text>
            {data.arguments.length === 0 ? (
              <Text style={styles.line}>No arguments logged yet.</Text>
            ) : (
              data.arguments.map((argument) => (
                <View key={argument.id} style={styles.item}>
                  <Text style={styles.itemTitle}>{argument.title}</Text>
                  <Text style={styles.itemMeta}>
                    {argument.status} • {argument.priority} • {argument.category}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      ) : (
        <View style={styles.loader}>
          <Text style={styles.loaderText}>Unable to load dashboard.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  loaderText: {
    marginTop: spacing.md,
    color: colors.neutral[400],
  },
  section: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: typography.heading.fontFamily,
    fontSize: typography.heading.fontSize,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  line: {
    color: colors.neutral[400],
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  highlight: {
    color: colors.brand[600],
    fontWeight: '600',
  },
  item: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  itemTitle: {
    color: colors.neutral[100],
    fontSize: 16,
    fontWeight: '600',
  },
  itemMeta: {
    marginTop: spacing.xs,
    color: colors.neutral[400],
    fontSize: 14,
  },
});

