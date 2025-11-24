import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { trackEvent } from '../services/analytics';
import { fetchDashboardOverview, DashboardOverview } from '../api/dashboard';
import { colors, spacing, typography, radii } from '../theme/tokens';
import { useAuthStore } from '../store/auth';
import { Card } from '../components/common';
import { PageHeading } from '../components/PageHeading';
import { StatCard, ActionCard } from '../components/DashboardCards';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, refreshSession } = useAuthStore();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const overview = await fetchDashboardOverview();
      setData(overview);
      trackEvent('dashboard_loaded', {
        arguments_count: overview.arguments.length,
        goals_count: overview.goals.length,
        subscription_tier: overview.subscription.tier,
      });
    } catch (error) {
      console.log('Failed to load dashboard overview', error);
      Sentry.captureException(error);
      trackEvent('dashboard_load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSession();
      await loadData();
      trackEvent('dashboard_refreshed');
    } catch (error) {
      console.log('Refresh failed', error);
      Sentry.captureException(error);
      trackEvent('dashboard_refresh_failed');
    } finally {
      setRefreshing(false);
    }
  }, [loadData, refreshSession]);

  useEffect(() => {
    trackEvent('dashboard_viewed');
    loadData();
  }, [loadData]);

  if (loading && !data) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Unable to load dashboard.</Text>
        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const usagePercentage = data.usage.is_unlimited
    ? 0
    : Math.min(Math.round((data.usage.count / Math.max(data.usage.limit, 1)) * 100), 100);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <PageHeading
        title={`Welcome back, ${user?.email?.split('@')[0] ?? 'there'}.`}
        description="Here's a snapshot of your relationship health."
      />

      {data.subscription.tier === 'free' && (
        <Card style={styles.trialCard}>
          <Text style={styles.trialTitle}>Free Trial Active</Text>
          <Text style={styles.trialDescription}>
            {data.usage.count}/{data.usage.limit} arguments used.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/subscription')}>
            <Text style={styles.buttonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </Card>
      )}

      <View style={styles.statsRow}>
        <StatCard
          label="Arguments Left"
          value={data.usage.is_unlimited ? '∞' : data.usage.limit - data.usage.count}
          description={data.subscription.trial_end ? `Trial ends ${new Date(data.subscription.trial_end).toLocaleDateString()}` : ''}
        />
        <StatCard
          label="Weekly Check-in"
          value={data.current_checkin?.status === 'completed' ? '✓' : '—'}
          description={data.current_checkin?.status === 'completed' ? 'Completed' : 'Pending'}
        />
        <StatCard
          label="Active Goals"
          value={data.goals.length}
          description={data.goals.length > 0 ? 'In progress' : 'No active goals'}
        />
      </View>

      {!data.usage.is_unlimited && (
        <Card>
          <Text style={styles.sectionTitle}>Usage Progress</Text>
          <View style={styles.progressWrapper}>
            <View style={[styles.progressBar, { width: `${usagePercentage}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{usagePercentage}% used</Text>
        </Card>
      )}

      <View style={styles.actionsRow}>
        <ActionCard
          title="Weekly Check-in"
          description={data.current_checkin?.status === 'completed' ? 'Completed this week ✓' : 'Stay aligned with a quick weekly pulse.'}
          buttonText={data.current_checkin?.status === 'completed' ? 'View Check-in' : 'Complete Check-in'}
          onPress={() => router.push('/checkins')}
        />
        <ActionCard
          title="Relationship Goals"
          description={`${data.goals.length} active goal${data.goals.length !== 1 ? 's' : ''} keeping you focused.`}
          buttonText="View Goals"
          onPress={() => router.push('/goals')}
        />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Recent Arguments</Text>
        {data.arguments.length === 0 ? (
          <Text style={styles.emptyText}>No arguments logged yet.</Text>
        ) : (
          data.arguments.slice(0, 3).map((arg) => (
            <TouchableOpacity key={arg.id} style={styles.argumentItem} onPress={() => router.push(`/argument?id=${arg.id}`)}>
              <Text style={styles.argumentTitle}>{arg.title}</Text>
              <Text style={styles.argumentMeta}>{arg.status} • {arg.priority}</Text>
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity style={styles.button} onPress={() => router.push('/arguments')}>
          <Text style={styles.buttonText}>View All Arguments</Text>
        </TouchableOpacity>
      </Card>
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
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  trialCard: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[200],
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  trialTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.brand[800],
  },
  trialDescription: {
    ...typography.body,
    color: colors.brand[700],
    marginVertical: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
    marginBottom: spacing.lg,
  },
  progressWrapper: {
    height: 8,
    backgroundColor: colors.neutral[700],
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.brand[500],
  },
  progressLabel: {
    ...typography.label,
    fontSize: 12,
    color: colors.neutral[400],
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  argumentItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },
  argumentTitle: {
    ...typography.label,
    color: colors.neutral[100],
  },
  argumentMeta: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
    padding: spacing.lg,
  },
});