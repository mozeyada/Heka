import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  fetchGoal,
  addGoalProgress,
  updateGoalStatus,
  GoalDetail,
} from "../../src/api/goals";
import { PageHeading } from "../../src/components/PageHeading";
import { Card, Section } from "../../src/components/common";
import {
  colors,
  spacing,
  typography,
  radii,
  shadows,
} from "../../src/theme/tokens";

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  active: { label: "In progress", tone: colors.brand[500] },
  completed: { label: "Completed", tone: colors.success },
  paused: { label: "Paused", tone: colors.warning },
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleDateString("en-AU", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function GoalDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [goal, setGoal] = useState<GoalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingProgress, setAddingProgress] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [markingComplete, setMarkingComplete] = useState(false);

  const loadGoal = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await fetchGoal(id);
      setGoal(data);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load goal details.";
      setError(detail);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoal();
  }, [loadGoal]);

  const handleAddProgress = async () => {
    if (!id) return;
    if (!progressNote.trim()) {
      Alert.alert("Add progress", "Write a quick note before submitting.");
      return;
    }

    try {
      setAddingProgress(true);
      await addGoalProgress(id, progressNote.trim());
      setProgressNote("");
      await loadGoal();
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Unable to add progress update.";
      Alert.alert("Update failed", detail);
    } finally {
      setAddingProgress(false);
    }
  };

  const handleCompleteGoal = () => {
    if (!id) return;
    Alert.alert(
      "Complete goal",
      "Celebrate this milestone? You can always restart later.",
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Mark complete",
          style: "destructive",
          onPress: async () => {
            try {
              setMarkingComplete(true);
              await updateGoalStatus(id, "completed");
              await loadGoal();
            } catch (err: any) {
              const detail =
                err.response?.data?.detail ||
                err.message ||
                "Failed to update goal status.";
              Alert.alert("Update failed", detail);
            } finally {
              setMarkingComplete(false);
            }
          },
        },
      ],
    );
  };

  if (loading && !goal) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loadingText}>Loading goal details…</Text>
      </View>
    );
  }

  if (error && !goal) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <Text style={styles.errorHeadline}>Unable to load goal</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadGoal}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!goal) {
    return null;
  }

  const statusCopy = STATUS_COPY[goal.status] ?? STATUS_COPY.active;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        <PageHeading
          title={goal.title}
          description={
            goal.description ||
            "Keep momentum with focused actions and shared reflections."
          }
          actions={
            goal.status !== "completed" ? (
              <TouchableOpacity
                style={[
                  styles.primaryAction,
                  markingComplete && styles.primaryActionDisabled,
                ]}
                onPress={handleCompleteGoal}
                disabled={markingComplete}
              >
                {markingComplete ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.primaryActionText}>Mark complete</Text>
                )}
              </TouchableOpacity>
            ) : undefined
          }
        />

        <LinearGradient
          colors={[statusCopy.tone, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroEyebrow}>Goal status</Text>
              <Text style={styles.heroStatus}>{statusCopy.label}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {goal.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.heroDates}>
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>Target date</Text>
              <Text style={styles.heroValue}>
                {formatDate(goal.target_date)}
              </Text>
            </View>
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>Created</Text>
              <Text style={styles.heroValue}>
                {formatDate(goal.created_at)}
              </Text>
            </View>
            {goal.completed_at && (
              <View style={styles.heroCol}>
                <Text style={styles.heroLabel}>Completed</Text>
                <Text style={styles.heroValue}>
                  {formatDate(goal.completed_at)}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <Section
          title="Momentum"
          subtitle="Track how this goal evolved over time."
        >
          <Card style={styles.momentumCard}>
            <View style={styles.momentumRow}>
              <View style={styles.momentumStat}>
                <Text style={styles.momentumValue}>
                  {goal.progress_updates ?? goal.progress?.length ?? 0}
                </Text>
                <Text style={styles.momentumLabel}>Updates logged</Text>
              </View>
              <View style={styles.momentumDivider} />
              <View style={styles.momentumStat}>
                <Text style={styles.momentumValue}>
                  {goal.status === "completed" ? "100%" : "In flight"}
                </Text>
                <Text style={styles.momentumLabel}>Completion</Text>
              </View>
            </View>
          </Card>
        </Section>

        <Section
          title="Quick reflection"
          subtitle="Log a note to keep progress visible for both of you."
        >
          <Card style={styles.addProgressCard}>
            <TextInput
              style={styles.input}
              placeholder="Capture what moved you forward today…"
              placeholderTextColor={colors.neutral[500]}
              multiline
              value={progressNote}
              onChangeText={setProgressNote}
            />
            <TouchableOpacity
              style={[
                styles.secondaryAction,
                addingProgress && styles.secondaryActionDisabled,
              ]}
              onPress={handleAddProgress}
              disabled={addingProgress}
            >
              {addingProgress ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <Ionicons name="send" size={16} color={colors.surface} />
                  <Text style={styles.secondaryActionText}>Log update</Text>
                </>
              )}
            </TouchableOpacity>
          </Card>
        </Section>

        <Section
          title="Timeline"
          subtitle={
            goal.progress && goal.progress.length > 0
              ? "Snapshots of your journey together."
              : "No updates yet — your first reflection will appear here."
          }
        >
          {goal.progress && goal.progress.length > 0 ? (
            <View style={styles.timeline}>
              {goal.progress
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((item, index) => (
                  <View
                    key={`${item.date}-${index}`}
                    style={styles.timelineItem}
                  >
                    <View style={styles.timelineMarker}>
                      <View style={styles.timelineDot} />
                      {index < goal.progress!.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    <Card style={styles.timelineCard}>
                      <Text style={styles.timelineDate}>
                        {formatDate(item.date)}
                      </Text>
                      {item.notes && (
                        <Text style={styles.timelineNotes}>{item.notes}</Text>
                      )}
                      {typeof item.progress_value === "number" && (
                        <Text style={styles.timelineValue}>
                          Progress score:{" "}
                          {(item.progress_value * 100).toFixed(0)}%
                        </Text>
                      )}
                    </Card>
                  </View>
                ))}
            </View>
          ) : (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="sparkles" size={20} color={colors.brand[500]} />
                <Text style={styles.emptyTitle}>Your journey starts now</Text>
                <Text style={styles.emptyBody}>
                  Add a reflection to see your momentum build over time.
                </Text>
              </View>
            </Card>
          )}
        </Section>

        <Section
          title="Need support?"
          subtitle="We are ready to help you design the next steps."
        >
          <Card style={styles.supportCard}>
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color={colors.brand[500]}
            />
            <Text style={styles.supportText}>
              Email hello@heka.app for guidance or to celebrate your wins.
            </Text>
          </Card>
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral[300],
  },
  errorHeadline: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  errorMessage: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.brand[500],
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  retryButtonText: {
    ...typography.label,
    color: colors.surface,
  },
  primaryAction: {
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  primaryActionDisabled: {
    opacity: 0.6,
  },
  primaryActionText: {
    ...typography.label,
    color: colors.surface,
  },
  hero: {
    borderRadius: radii.xl,
    padding: spacing["2xl"],
    gap: spacing.lg,
    ...shadows.card,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroEyebrow: {
    ...typography.label,
    color: colors.surface,
    opacity: 0.8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  heroStatus: {
    ...typography.heading,
    color: colors.surface,
    fontSize: 28,
  },
  heroBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 100,
    backgroundColor: "rgba(15, 23, 42, 0.15)",
  },
  heroBadgeText: {
    ...typography.label,
    color: colors.surface,
    letterSpacing: 1.2,
  },
  heroDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  heroCol: {
    flexShrink: 0,
  },
  heroLabel: {
    ...typography.label,
    color: colors.surface,
    opacity: 0.75,
    marginBottom: spacing.xs,
  },
  heroValue: {
    ...typography.body,
    color: colors.surface,
  },
  momentumCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  momentumRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  momentumStat: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  momentumDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.neutral[700],
  },
  momentumValue: {
    ...typography.heading,
    fontSize: 24,
    color: colors.neutral[100],
  },
  momentumLabel: {
    ...typography.body,
    color: colors.neutral[400],
  },
  addProgressCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  input: {
    minHeight: 96,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    padding: spacing.md,
    ...typography.body,
    color: colors.neutral[100],
    backgroundColor: colors.neutral[800],
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand[600],
  },
  secondaryActionDisabled: {
    opacity: 0.6,
  },
  secondaryActionText: {
    ...typography.label,
    color: colors.surface,
  },
  timeline: {
    gap: spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineMarker: {
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand[500],
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[700],
    marginTop: spacing.xs,
  },
  timelineCard: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  timelineDate: {
    ...typography.label,
    color: colors.neutral[400],
  },
  timelineNotes: {
    ...typography.body,
    color: colors.neutral[100],
  },
  timelineValue: {
    ...typography.body,
    color: colors.neutral[400],
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.neutral[100],
  },
  emptyBody: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: "center",
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  supportText: {
    ...typography.body,
    color: colors.neutral[400],
    flex: 1,
  },
});
