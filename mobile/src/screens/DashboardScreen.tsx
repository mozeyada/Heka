import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchDashboardOverview, DashboardOverview } from "../api/dashboard";
import { Card } from "../components/common";
import { trackEvent } from "../services/analytics";
import { useAuthStore } from "../store/auth";
import {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  gradients,
} from "../theme/tokens";

type IoniconName = keyof typeof Ionicons.glyphMap;

const withAlpha = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const categoryIconMap: Record<
  string,
  {
    icon: IoniconName;
    backgroundColor: string;
    iconColor: string;
    label: string;
  }
> = {
  communication: {
    icon: "chatbubbles-outline",
    backgroundColor: withAlpha(colors.brand[500], 0.12),
    iconColor: colors.brand[600],
    label: "Communication",
  },
  trust: {
    icon: "shield-checkmark",
    backgroundColor: withAlpha(colors.neutral[200], 0.18),
    iconColor: colors.neutral[200],
    label: "Trust & Safety",
  },
  values: {
    icon: "heart-outline",
    backgroundColor: withAlpha(colors.danger, 0.12),
    iconColor: colors.danger,
    label: "Values & Beliefs",
  },
  intimacy: {
    icon: "color-wand-outline",
    backgroundColor: withAlpha(colors.brand[300], 0.18),
    iconColor: colors.brand[600],
    label: "Intimacy",
  },
  finances: {
    icon: "cash-outline",
    backgroundColor: withAlpha(colors.warning, 0.12),
    iconColor: colors.warning,
    label: "Finances",
  },
};

const defaultCategoryIcon = {
  icon: "chatbubble-ellipses" as IoniconName,
  backgroundColor: withAlpha(colors.brand[500], 0.12),
  iconColor: colors.brand[600],
  label: "Relationship",
};

const getCategoryIconConfig = (category?: string) => {
  if (!category) return defaultCategoryIcon;
  const key = category.toLowerCase().trim();
  return categoryIconMap[key] ?? defaultCategoryIcon;
};

const statusBadgeVariants: Record<
  string,
  { backgroundColor: string; borderColor: string; textColor: string }
> = {
  analyzed: {
    backgroundColor: withAlpha(colors.success, 0.12),
    borderColor: withAlpha(colors.success, 0.4),
    textColor: colors.success,
  },
  pending: {
    backgroundColor: withAlpha(colors.warning, 0.12),
    borderColor: withAlpha(colors.warning, 0.4),
    textColor: colors.warning,
  },
  draft: {
    backgroundColor: withAlpha(colors.neutral[600], 0.5),
    borderColor: colors.neutral[600],
    textColor: colors.neutral[400],
  },
  default: {
    backgroundColor: withAlpha(colors.brand[500], 0.1),
    borderColor: withAlpha(colors.brand[500], 0.3),
    textColor: colors.brand[500],
  },
};

const getStatusBadgeVariant = (status?: string) => {
  if (!status) {
    return statusBadgeVariants.default;
  }
  const key = status.toLowerCase().trim();
  return statusBadgeVariants[key] ?? statusBadgeVariants.default;
};

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
      trackEvent("dashboard_loaded", {
        arguments_count: overview.arguments.length,
        goals_count: overview.goals.length,
        subscription_tier: overview.subscription.tier,
      });
    } catch (error) {
      console.log("Failed to load dashboard overview", error);
      Sentry.captureException(error);
      trackEvent("dashboard_load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshSession();
      await loadData();
      trackEvent("dashboard_refreshed");
    } catch (error) {
      console.log("Refresh failed", error);
      Sentry.captureException(error);
      trackEvent("dashboard_refresh_failed");
    } finally {
      setRefreshing(false);
    }
  }, [loadData, refreshSession]);

  useEffect(() => {
    trackEvent("dashboard_viewed");
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
    : Math.min(
      Math.round((data.usage.count / Math.max(data.usage.limit, 1)) * 100),
      100,
    );

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Extract user name: prefer user.name, fallback to email username, capitalize first letter
  const rawUserName =
    user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? null;
  const userName = rawUserName
    ? rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1).toLowerCase()
    : null;
  const isCheckinCompleted = data.current_checkin?.status === "completed";
  const goalsCount = data.goals.length;
  const activeGoalsLabel = goalsCount === 1 ? "Goal" : "Goals";
  const topArguments = data.arguments
    .filter((arg) => arg.status !== "resolved")
    .slice(0, 3);
  const hasArguments = topArguments.length > 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: 110, // Added padding for floating tab bar
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand[500]}
        />
      }
    >
      <LinearGradient
        colors={gradients.hero}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
      />
      {/* Header Section with Safe Area Padding */}
      <View style={styles.headerSection}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}
            {userName ? `, ${userName}` : ""}.
          </Text>
          <Text style={styles.subtitle}>Your relationship pulse.</Text>
        </View>
        {/* Profile Avatar and Settings */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.neutral[300]}
            />
          </TouchableOpacity>
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
                <Text style={styles.primaryActionTitle}>
                  Resolve a Conflict
                </Text>
                <Text style={styles.primaryActionDescription}>
                  Feeling heard is the first step. Start a guided AI mediation
                  session now.
                </Text>
              </View>
              <View style={styles.primaryActionIcon}>
                <Ionicons name="sparkles" size={24} color={colors.brand[600]} />
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/arguments/create")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={18}
                color={colors.surface}
                style={styles.primaryButtonIcon}
              />
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
              <View style={[styles.statCardIcon, styles.statCardIconCheckin]}>
                <Ionicons
                  name={
                    isCheckinCompleted
                      ? "checkmark-circle"
                      : "clipboard-outline"
                  }
                  size={22}
                  color={
                    isCheckinCompleted ? colors.success : colors.brand[600]
                  }
                />
              </View>
            </View>
            <View style={styles.statCardBody}>
              <View>
                <Text style={styles.statValue}>
                  {isCheckinCompleted ? "✓" : "—"}
                </Text>
                <Text
                  style={[
                    styles.statDescription,
                    isCheckinCompleted
                      ? styles.statDescriptionPositive
                      : styles.statDescriptionWarning,
                  ]}
                >
                  {isCheckinCompleted ? "Completed" : "Pending"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statButton,
                  isCheckinCompleted
                    ? styles.statButtonSecondary
                    : styles.statButtonPrimary,
                ]}
                onPress={() => router.push("/checkins")}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.statButtonText,
                    isCheckinCompleted
                      ? styles.statButtonTextSecondary
                      : styles.statButtonTextPrimary,
                  ]}
                >
                  {isCheckinCompleted ? "View" : "Complete Now"}
                </Text>
                <Ionicons
                  name={isCheckinCompleted ? "arrow-forward" : "flash"}
                  size={16}
                  color={
                    isCheckinCompleted ? colors.neutral[300] : colors.surface
                  }
                  style={styles.statButtonIcon}
                />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={styles.statCardWrapper}>
          <Card style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statLabel}>Active Goals</Text>
              <View style={[styles.statCardIcon, styles.statCardIconGoals]}>
                <Ionicons name="flag" size={20} color={colors.brand[600]} />
              </View>
            </View>
            <View style={styles.statCardBody}>
              <View>
                <Text style={styles.statValue}>{goalsCount}</Text>
                <Text style={styles.statDescription}>{activeGoalsLabel}</Text>
              </View>
              <TouchableOpacity
                style={[styles.statButton, styles.statButtonGhost]}
                onPress={() => router.push("/goals")}
                activeOpacity={0.9}
              >
                <Text
                  style={[styles.statButtonText, styles.statButtonTextGhost]}
                >
                  View Goals
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.brand[600]}
                />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </View>

      {/* Active Issues / Recent Arguments */}
      <Card style={styles.argumentsCard}>
        <View style={styles.argumentsHeader}>
          <Text style={styles.sectionTitle}>Active Issues</Text>
          {data.arguments.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/arguments")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {!hasArguments ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No active conflicts. You're in a good place.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push("/arguments/create")}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyStateButtonText}>Start New Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.argumentsList}>
            {topArguments.map((arg, index) => {
              const { icon, backgroundColor, iconColor, label } =
                getCategoryIconConfig(arg.category);
              const statusVariant = getStatusBadgeVariant(arg.status);
              return (
                <TouchableOpacity
                  key={arg.id}
                  style={[
                    styles.argumentItem,
                    index < topArguments.length - 1 &&
                    styles.argumentItemBorder,
                  ]}
                  onPress={() => router.push(`/arguments/${arg.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.argumentLeft}>
                    <View style={[styles.argumentIcon, { backgroundColor }]}>
                      <Ionicons name={icon} size={18} color={iconColor} />
                    </View>
                    <View style={styles.argumentContent}>
                      <Text style={styles.argumentTitle} numberOfLines={1}>
                        {arg.title}
                      </Text>
                      <View style={styles.argumentMetaRow}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: statusVariant.backgroundColor,
                              borderColor: statusVariant.borderColor,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: statusVariant.textColor },
                            ]}
                          >
                            {arg.status}
                          </Text>
                        </View>
                        <Text style={styles.argumentCategory} numberOfLines={1}>
                          {label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card>

      {/* Subscription/Usage - Subtle Bottom Section */}
      {data.subscription &&
        !data.usage.is_unlimited &&
        data.usage.limit > 0 && (
          <Card style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageLabel}>Plan Status</Text>
              <TouchableOpacity onPress={() => router.push("/subscription")}>
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
                      backgroundColor:
                        usagePercentage >= 100
                          ? colors.danger
                          : colors.brand[500],
                    },
                  ]}
                />
              </View>
              {data.subscription.trial_end && (
                <Text style={styles.trialEndText}>
                  Trial ends{" "}
                  {new Date(data.subscription.trial_end).toLocaleDateString()}
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
    paddingBottom: spacing["2xl"],
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
  },
  button: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  // Header Section with Avatar
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontWeight: "700",
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  avatarContainer: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  // Primary Action Card
  primaryActionCard: {
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadows.soft,
  },
  primaryActionGradient: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  primaryActionContent: {
    padding: spacing["2xl"],
  },
  primaryActionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontWeight: "700",
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
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    ...shadows.soft,
  },
  primaryButtonIcon: {
    marginRight: spacing.sm,
  },
  primaryButtonText: {
    ...typography.label,
    fontSize: 16,
    color: colors.surface,
    fontWeight: "600",
  },
  // Stats Row - 2 Columns
  statsRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCardWrapper: {
    flex: 1,
    marginBottom: 0,
    minHeight: 0,
  },
  statCard: {
    padding: spacing["2xl"],
    minHeight: 200,
    flex: 1,
    borderWidth: 1,
    borderColor: withAlpha(colors.neutral[200], 0.4),
    backgroundColor: colors.surface,
    marginBottom: 0,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardIconCheckin: {
    backgroundColor: withAlpha(colors.brand[500], 0.15),
  },
  statCardIconGoals: {
    backgroundColor: withAlpha(colors.brand[200], 0.35),
  },
  statCardBody: {
    flex: 1,
    justifyContent: "space-between",
  },
  statLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[400],
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  statValue: {
    ...typography.heading,
    fontSize: 32,
    color: colors.neutral[100],
    marginBottom: spacing.xs,
    fontWeight: "700",
  },
  statDescription: {
    ...typography.body,
    fontSize: 13,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  statDescriptionPositive: {
    color: colors.success,
  },
  statDescriptionWarning: {
    color: colors.warning,
  },
  statButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statButtonText: {
    ...typography.label,
    fontSize: 13,
    fontWeight: "600",
  },
  statButtonPrimary: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  statButtonSecondary: {
    backgroundColor: colors.neutral[700],
    borderColor: colors.neutral[700],
  },
  statButtonGhost: {
    backgroundColor: withAlpha(colors.neutral[700], 0.4),
    borderColor: "transparent",
  },
  statButtonTextPrimary: {
    color: colors.surface,
  },
  statButtonTextSecondary: {
    color: colors.neutral[300],
  },
  statButtonTextGhost: {
    color: colors.brand[600],
  },
  statButtonIcon: {
    marginLeft: spacing.xs,
  },
  // Arguments Card
  argumentsCard: {
    marginBottom: spacing.lg,
    padding: spacing["2xl"],
  },
  argumentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
    fontWeight: "700",
  },
  viewAllLink: {
    ...typography.label,
    fontSize: 13,
    color: colors.brand[500],
    fontWeight: "600",
  },
  argumentsList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  argumentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: withAlpha(colors.neutral[700], 0.5),
  },
  argumentItemBorder: {
    marginBottom: spacing.sm,
  },
  argumentLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  argumentContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  argumentIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  argumentTitle: {
    ...typography.label,
    fontSize: 16,
    color: colors.neutral[100],
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  argumentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  statusBadgeText: {
    ...typography.label,
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  argumentCategory: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[400],
    flex: 1,
    marginLeft: spacing.sm,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: "center",
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
    fontWeight: "600",
  },
  // Usage Card (Subtle)
  usageCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg + 4,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  usageLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  viewOptionsLink: {
    ...typography.label,
    fontSize: 11,
    color: colors.brand[500],
    fontWeight: "600",
  },
  usageContent: {
    marginTop: spacing.sm,
  },
  usageTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: "100%",
    borderRadius: radii.xl,
  },
  trialEndText: {
    ...typography.body,
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
});
