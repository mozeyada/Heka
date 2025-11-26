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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { trackEvent } from '../services/analytics';
import { fetchDashboardOverview, DashboardOverview } from '../api/dashboard';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';
import { useAuthStore } from '../store/auth';
import { Card } from '../components/common';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, refreshSession } = useAuthStore();
  const insets = useSafeAreaInsets();
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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.email?.split('@')[0] ?? null;
  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      {/* Header Section with Safe Area Padding */}
      <View style={styles.headerSection}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}{userName ? `, ${userName}` : ''}.
          </Text>
          <Text style={styles.subtitle}>Your relationship pulse.</Text>
        </View>
        {/* Profile Avatar (Standard App Pattern) */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
        </View>
      </View>

      {/* Primary Action Card - Start New Session */}
      <View style={styles.primaryActionCard}>
        <LinearGradient
          colors={[colors.brand[50], colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryActionGradient}
        >
          <View style={styles.primaryActionContent}>
            <View style={styles.primaryActionHeader}>
              <View style={styles.primaryActionTextContainer}>
                <Text style={styles.primaryActionTitle}>Resolve a Conflict</Text>
                <Text style={styles.primaryActionDescription}>
                  Feeling heard is the first step. Start a guided AI mediation session now.
                </Text>
              </View>
              <View style={styles.primaryActionIcon}>
                <Ionicons name="sparkles" size={24} color={colors.brand[600]} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/arguments/create')}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color={colors.surface} style={styles.primaryButtonIcon} />
              <Text style={styles.primaryButtonText}>Start New Session</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Status Grid - 2 Columns (Fixed Layout) */}
      <View style={styles.statsRow}>
        <View style={styles.statCardWrapper}>
          <Card style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Weekly Check-in</Text>
              <View style={styles.statCardIcon}>
                <Ionicons
                  name={data.current_checkin?.status === 'completed' ? 'checkmark-circle' : 'clipboard-outline'}
                  size={24}
                  color={data.current_checkin?.status === 'completed' ? colors.success : colors.neutral[500]}
                />
              </View>
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statValue}>
                {data.current_checkin?.status === 'completed' ? '✓' : '—'}
              </Text>
              <Text style={styles.statDescription}>
                {data.current_checkin?.status === 'completed' ? 'Completed' : 'Pending'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => router.push('/checkins')}
              activeOpacity={0.7}
            >
              <Text style={styles.statButtonText}>
                {data.current_checkin?.status === 'completed' ? 'View' : 'Complete Now'}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.statCardWrapper}>
          <Card style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Active Goals</Text>
              <View style={styles.statCardIcon}>
                <Ionicons
                  name="flag"
                  size={24}
                  color={data.goals.length > 0 ? colors.brand[500] : colors.neutral[500]}
                />
              </View>
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statValue}>{data.goals.length}</Text>
              <Text style={styles.statDescription}>
                {data.goals.length === 1 ? 'Goal' : 'Goals'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => router.push('/goals')}
              activeOpacity={0.7}
            >
              <Text style={styles.statButtonText}>View Goals</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </View>

      {/* Active Issues / Recent Arguments */}
      <Card style={styles.argumentsCard}>
        <View style={styles.argumentsHeader}>
          <Text style={styles.sectionTitle}>Active Issues</Text>
          {data.arguments.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/arguments')} activeOpacity={0.7}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {data.arguments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active conflicts. You're in a good place.</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/arguments/create')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyStateButtonText}>Start New Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.argumentsList}>
            {data.arguments.slice(0, 3).map((arg, index) => (
              <TouchableOpacity
                key={arg.id}
                style={[
                  styles.argumentItem,
                  index < data.arguments.slice(0, 3).length - 1 && styles.argumentItemBorder,
                ]}
                onPress={() => router.push(`/argument?id=${arg.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.argumentContent}>
                  <Text style={styles.argumentTitle} numberOfLines={1}>{arg.title}</Text>
                  <View style={styles.argumentMetaRow}>
                    <View style={[
                      styles.statusBadge,
                      arg.status === 'analyzed' && styles.statusBadgeSuccess,
                      arg.status === 'draft' && styles.statusBadgeDraft,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        arg.status === 'analyzed' && styles.statusBadgeTextSuccess,
                        arg.status === 'draft' && styles.statusBadgeTextDraft,
                      ]}>
                        {arg.status}
                      </Text>
                    </View>
                    <Text style={styles.argumentCategory} numberOfLines={1}>
                      {arg.category}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.neutral[500]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* Subscription/Usage - Subtle Bottom Section */}
      {data.subscription && !data.usage.is_unlimited && data.usage.limit > 0 && (
        <Card style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageLabel}>Plan Status</Text>
            <TouchableOpacity onPress={() => router.push('/subscription')}>
              <Text style={styles.viewOptionsLink}>View Options</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usageContent}>
            <View style={styles.usageTextRow}>
              <Text style={styles.usageText}>
                {data.usage.count} of {data.usage.limit} free sessions used
              </Text>
              <Text style={styles.usagePercentage}>{usagePercentage}%</Text>
            </View>
            <View style={styles.progressWrapper}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${usagePercentage}%`,
                    backgroundColor: usagePercentage >= 100 ? colors.danger : colors.brand[500],
                  },
                ]}
              />
            </View>
            {data.subscription.trial_end && (
              <Text style={styles.trialEndText}>
                Trial ends {new Date(data.subscription.trial_end).toLocaleDateString()}
              </Text>
            )}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
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
  // Header Section with Avatar
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    ...typography.heading,
    fontSize: 28,
    color: colors.neutral[100],
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  avatarContainer: {
    marginTop: spacing.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand[50],
    borderWidth: 1.5,
    borderColor: colors.brand[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.heading,
    fontSize: 18,
    color: colors.brand[600],
    fontWeight: '700',
  },
  // Primary Action Card
  primaryActionCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  primaryActionGradient: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.brand[200],
  },
  primaryActionContent: {
    padding: spacing['2xl'],
  },
  primaryActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  primaryActionTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  primaryActionTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  primaryActionDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
    lineHeight: 20,
  },
  primaryActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...shadows.card,
  },
  primaryButtonIcon: {
    marginRight: spacing.sm,
  },
  primaryButtonText: {
    ...typography.label,
    fontSize: 16,
    color: colors.surface,
    fontWeight: '600',
  },
  // Stats Row - 2 Columns
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    padding: spacing.lg + 4,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  statCardIcon: {
    marginTop: -2,
  },
  statCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  statValue: {
    ...typography.heading,
    fontSize: 32,
    color: colors.neutral[100],
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  statValueLarge: {
    ...typography.heading,
    fontSize: 48,
    color: colors.neutral[100],
    marginBottom: spacing.xs,
    fontWeight: '800',
    lineHeight: 56,
  },
  statDescription: {
    ...typography.body,
    fontSize: 13,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  statButton: {
    borderWidth: 1.5,
    borderColor: colors.neutral[600],
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statButtonText: {
    ...typography.label,
    fontSize: 13,
    color: colors.neutral[200],
    fontWeight: '600',
  },
  // Arguments Card
  argumentsCard: {
    marginBottom: spacing.lg,
    padding: spacing['2xl'],
  },
  argumentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
    fontWeight: '700',
  },
  viewAllLink: {
    ...typography.label,
    fontSize: 13,
    color: colors.brand[500],
    fontWeight: '600',
  },
  argumentsList: {
    gap: spacing.md,
  },
  argumentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  argumentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },
  argumentContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  argumentTitle: {
    ...typography.label,
    fontSize: 16,
    color: colors.neutral[100],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  argumentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  statusBadgeSuccess: {
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '10',
  },
  statusBadgeDraft: {
    borderColor: colors.neutral[600],
    backgroundColor: 'transparent',
  },
  statusBadgeText: {
    ...typography.label,
    fontSize: 9,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  statusBadgeTextSuccess: {
    color: colors.success,
  },
  statusBadgeTextDraft: {
    color: colors.neutral[400],
  },
  argumentCategory: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[400],
    flex: 1,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    borderWidth: 1,
    borderColor: colors.brand[300],
    backgroundColor: colors.brand[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  emptyStateButtonText: {
    ...typography.label,
    fontSize: 13,
    color: colors.brand[700],
    fontWeight: '600',
  },
  // Usage Card (Subtle)
  usageCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg + 4,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  usageLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewOptionsLink: {
    ...typography.label,
    fontSize: 11,
    color: colors.brand[500],
    fontWeight: '600',
  },
  usageContent: {
    marginTop: spacing.sm,
  },
  usageTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  usageText: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[300],
  },
  usagePercentage: {
    ...typography.label,
    fontSize: 12,
    color: colors.neutral[400],
  },
  progressWrapper: {
    height: 6,
    backgroundColor: colors.neutral[700],
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: radii.xl,
  },
  trialEndText: {
    ...typography.body,
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
});