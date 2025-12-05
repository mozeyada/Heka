import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchArguments, Argument } from "../api/arguments";
import { ArgumentCard } from "../components/ArgumentCard";
import { PageHeading } from "../components/PageHeading";
import { Card } from "../components/common";
import { colors, spacing, typography, radii, shadows } from "../theme/tokens";

type IoniconName = keyof typeof Ionicons.glyphMap;

export default function ArgumentsScreen() {
  const router = useRouter();
  const [args, setArgs] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const insets = useSafeAreaInsets();

  const statusCounts = useMemo(() => {
    return args.reduce(
      (acc, arg) => {
        const key = arg.status?.toLowerCase() ?? "draft";
        if (key === "draft") acc.draft += 1;
        else if (key === "analyzed") acc.analyzed += 1;
        else if (key === "resolved") acc.resolved += 1;
        else acc.active += 1;
        return acc;
      },
      { active: 0, draft: 0, analyzed: 0, resolved: 0 },
    );
  }, [args]);

  const statCards: {
    label: string;
    value: number;
    icon: IoniconName;
    accent: string;
    subtitle: string;
  }[] = [
      {
        label: "Active",
        value: statusCounts.active,
        icon: "flame",
        accent: colors.brand[600],
        subtitle: "Needs action",
      },
      {
        label: "History",
        value: statusCounts.resolved,
        icon: "checkmark-circle",
        accent: colors.success,
        subtitle: "Resolved",
      },
      {
        label: "Drafts",
        value: statusCounts.draft,
        icon: "pencil",
        accent: colors.neutral[300],
        subtitle: "In progress",
      },
    ];

  const contentContainerStyle = useMemo(
    () => [
      styles.container,
      { paddingTop: spacing.lg + insets.top, paddingBottom: 110 },
    ],
    [insets.top],
  );

  const loadArguments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArguments();
      setArgs(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load arguments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArguments();
  }, [loadArguments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadArguments().finally(() => setRefreshing(false));
  }, [loadArguments]);

  const filteredArgs = args.filter((arg) => {
    if (activeTab === "active") {
      return arg.status !== "resolved";
    }
    return arg.status === "resolved";
  });

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
      contentContainerStyle={contentContainerStyle}
      contentInsetAdjustmentBehavior="always"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand[500]}
        />
      }
    >
      <PageHeading
        title="Arguments"
        description="Track open conflicts, gather insights, and move toward resolution."
        actions={
          <TouchableOpacity
            style={styles.headingAction}
            onPress={() => router.push("/arguments/create")}
          >
            <Ionicons name="add" size={16} color={colors.brand[600]} />
            <Text style={styles.headingActionText}>New</Text>
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "active" && (
        <LinearGradient
          colors={[colors.brand[50], colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Resolve Smart</Text>
              <Text style={styles.heroSubtitle}>
                Use structured prompts to capture both perspectives before
                tensions rise.
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="sparkles" size={24} color={colors.brand[600]} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/arguments/create")}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={16} color={colors.surface} />
            <Text style={styles.primaryButtonText}>Start Argument Intake</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      <View style={styles.statsRow}>
        {statCards.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${stat.accent}22` },
                ]}
              >
                <Ionicons name={stat.icon} size={16} color={stat.accent} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
          </View>
        ))}
      </View>

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {activeTab === "active" ? "Active Issues" : "Resolution History"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {activeTab === "active"
              ? "Tap an issue to continue mediation."
              : "Review past resolutions and insights."}
          </Text>
        </View>
        {activeTab === "active" && (
          <TouchableOpacity
            style={styles.sectionAction}
            onPress={() => router.push("/arguments/create")}
          >
            <Text style={styles.sectionActionText}>Log new</Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={colors.brand[600]}
            />
          </TouchableOpacity>
        )}
      </View>

      {filteredArgs.length === 0 && !loading ? (
        <Card style={styles.emptyCard}>
          <Ionicons
            name={
              activeTab === "active" ? "leaf-outline" : "file-tray-outline"
            }
            size={24}
            color={colors.neutral[300]}
          />
          <Text style={styles.emptyText}>
            {activeTab === "active"
              ? "No active conflicts. Great job!"
              : "No resolved arguments yet."}
          </Text>
        </Card>
      ) : (
        <View style={styles.argumentList}>
          {filteredArgs.map((arg) => (
            <ArgumentCard
              key={arg.id}
              argument={arg}
              onPress={() => router.push(`/arguments/${arg.id}`)}
            />
          ))}
        </View>
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
    gap: spacing.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
  },
  headingAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  headingActionText: {
    ...typography.label,
    color: colors.brand[600],
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing["2xl"],
    borderWidth: 1,
    borderColor: colors.brand[200],
    ...shadows.card,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  heroTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.neutral[100],
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.neutral[400],
    lineHeight: 20,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand[100],
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.brand[600],
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryButtonText: {
    ...typography.label,
    color: colors.surface,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  statCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    ...typography.label,
    color: colors.neutral[400],
    textTransform: "uppercase",
    fontSize: 11,
  },
  statValue: {
    ...typography.heading,
    fontSize: 28,
    color: colors.neutral[100],
  },
  statSubtitle: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  errorCard: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sectionActionText: {
    ...typography.label,
    color: colors.brand[600],
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing["2xl"],
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: "center",
  },
  argumentList: {
    gap: spacing.md,
  },
  tabContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  activeTab: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  tabText: {
    ...typography.label,
    color: colors.neutral[500],
  },
  activeTabText: {
    color: colors.surface,
  },
});
