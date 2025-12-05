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
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchGoalSuggestions, AIGoalSuggestion } from "../api/ai_suggestions";
import { fetchGoals, createGoal, updateGoalStatus, Goal } from "../api/goals";
import { GoalCard } from "../components/GoalCard";
import { PageHeading } from "../components/PageHeading";
import { Card } from "../components/common";
import { colors, spacing, typography, radii, shadows } from "../theme/tokens";

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_date: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AIGoalSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to load goals.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // No need to check auth here - we're already in protected (tabs) route
    loadGoals();
    loadAISuggestions();
  }, [loadGoals]);

  const loadAISuggestions = useCallback(async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetchGoalSuggestions();
      setAiSuggestions(response.suggestions || []);
    } catch (err: any) {
      console.log("Failed to load AI suggestions:", err);
      // Don't show error - suggestions are optional
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleCreateFromSuggestion = async (suggestion: AIGoalSuggestion) => {
    setIsCreating(true);
    setError(null);
    try {
      await createGoal({
        title: suggestion.title,
        description: suggestion.description,
        target_date: "",
      });
      setShowCreateForm(false);
      loadGoals();
      // Remove used suggestion
      setAiSuggestions(
        aiSuggestions.filter((s) => s.title !== suggestion.title),
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create goal.");
    } finally {
      setIsCreating(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals().finally(() => setRefreshing(false));
  }, [loadGoals]);

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) {
      setError("Title is required.");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      await createGoal(newGoal);
      setNewGoal({ title: "", description: "", target_date: "" });
      setShowCreateForm(false);
      loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create goal.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await updateGoalStatus(goalId, "completed");
      loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to complete goal.");
    }
  };

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals],
  );
  const completedGoals = useMemo(
    () => goals.filter((g) => g.status === "completed"),
    [goals],
  );
  const completionRate = goals.length
    ? Math.round((completedGoals.length / goals.length) * 100)
    : 0;
  const insets = useSafeAreaInsets();

  const goalStats = [
    {
      label: "Active",
      value: activeGoals.length,
      icon: "flag",
      accent: colors.brand[600],
      subtitle: "In progress",
    },
    {
      label: "Completed",
      value: completedGoals.length,
      icon: "checkmark-circle",
      accent: colors.success,
      subtitle: "Finished",
    },
    {
      label: "Focus",
      value: Math.max(activeGoals.length - completedGoals.length, 0),
      icon: "flash",
      accent: colors.warning,
      subtitle: "Needs attention",
    },
  ] as const;

  const contentContainerStyle = useMemo(
    () => [
      styles.container,
      { paddingTop: spacing.lg + insets.top, paddingBottom: 110 },
    ],
    [insets.top],
  );

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
        title="Relationship Goals"
        description="Celebrate wins and set growth milestones together."
      />

      <LinearGradient
        colors={[colors.brand[50], colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Shared Milestones</Text>
            <Text style={styles.heroSubtitle}>
              Align on what matters most. Track commitments and reflections in
              one calm space.
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroMetric}>{completionRate}%</Text>
            <Text style={styles.heroMetricLabel}>complete</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowCreateForm((prev) => !prev)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={showCreateForm ? "close" : "add"}
            size={18}
            color={colors.surface}
          />
          <Text style={styles.primaryButtonText}>
            {showCreateForm ? "Close Composer" : "Add New Goal"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        {goalStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: `${stat.accent}22` }]}
            >
              <Ionicons name={stat.icon as any} size={18} color={stat.accent} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
          </View>
        ))}
      </View>

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {aiSuggestions.length > 0 &&
        activeGoals.length > 0 &&
        !showCreateForm && (
          <Card style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <View style={styles.suggestionsIconContainer}>
                <Ionicons name="sparkles" size={20} color={colors.brand[600]} />
              </View>
              <View style={styles.suggestionsHeaderText}>
                <Text style={styles.suggestionsTitle}>
                  AI-Powered Goal Suggestions
                </Text>
                <Text style={styles.suggestionsSubtitle}>
                  Based on your recent arguments, here are additional goals to
                  consider.
                </Text>
              </View>
            </View>
            <View style={styles.suggestionsList}>
              {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                <Card key={index} style={styles.suggestionItem}>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle}>
                      {suggestion.title}
                    </Text>
                    <Text
                      style={styles.suggestionDescription}
                      numberOfLines={2}
                    >
                      {suggestion.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.suggestionButton,
                      isCreating && styles.buttonDisabled,
                    ]}
                    onPress={() => handleCreateFromSuggestion(suggestion)}
                    disabled={isCreating}
                  >
                    <Text style={styles.suggestionButtonText}>
                      {isCreating ? "Creating..." : "Use This"}
                    </Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          </Card>
        )}

      {showCreateForm && (
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Create New Goal</Text>
          <Text style={styles.sectionSubtitle}>
            Define what success looks like this week.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Goal Title"
            placeholderTextColor={colors.neutral[400]}
            value={newGoal.title}
            onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.neutral[400]}
            value={newGoal.description}
            onChangeText={(text) =>
              setNewGoal({ ...newGoal, description: text })
            }
            multiline
          />
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isCreating && styles.buttonDisabled,
            ]}
            onPress={handleCreateGoal}
            disabled={isCreating}
          >
            <Text style={styles.secondaryButtonText}>
              {isCreating ? "Creating..." : "Save Goal"}
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {goals.length === 0 && !showCreateForm ? (
        <View style={styles.emptySection}>
          {aiSuggestions.length > 0 && (
            <Card style={styles.suggestionsCard}>
              <View style={styles.suggestionsHeader}>
                <View style={styles.suggestionsIconContainer}>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={colors.brand[600]}
                  />
                </View>
                <View style={styles.suggestionsHeaderText}>
                  <Text style={styles.suggestionsTitle}>
                    AI-Powered Suggestions
                  </Text>
                  <Text style={styles.suggestionsSubtitle}>
                    Based on your recent arguments, here are personalized goals
                    to strengthen your relationship.
                  </Text>
                </View>
              </View>
              <View style={styles.suggestionsList}>
                {aiSuggestions.map((suggestion, index) => (
                  <Card key={index} style={styles.suggestionItem}>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle}>
                        {suggestion.title}
                      </Text>
                      <Text style={styles.suggestionDescription}>
                        {suggestion.description}
                      </Text>
                      {suggestion.category && (
                        <View style={styles.suggestionCategory}>
                          <Text style={styles.suggestionCategoryText}>
                            {suggestion.category}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.suggestionButton,
                        isCreating && styles.buttonDisabled,
                      ]}
                      onPress={() => handleCreateFromSuggestion(suggestion)}
                      disabled={isCreating}
                    >
                      <Text style={styles.suggestionButtonText}>
                        {isCreating ? "Creating..." : "Use This"}
                      </Text>
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            </Card>
          )}
          <Card style={styles.emptyCard}>
            <Ionicons
              name="leaf-outline"
              size={24}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyText}>
              {aiSuggestions.length === 0 && !loadingSuggestions
                ? "No goals yet. Create one to get started!"
                : "Or create a custom goal below."}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Text style={styles.primaryButtonText}>Create Custom Goal</Text>
            </TouchableOpacity>
          </Card>
        </View>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Goals</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap to view progress or mark complete.
                </Text>
              </View>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => router.push(`/goals/${goal.id}`)}
                  onComplete={() => handleCompleteGoal(goal.id)}
                />
              ))}
            </View>
          )}

          {completedGoals.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Completed</Text>
                <Text style={styles.sectionSubtitle}>
                  Moments worth celebrating and reflecting on.
                </Text>
              </View>
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => router.push(`/goals/${goal.id}`)}
                  onComplete={() => {}}
                />
              ))}
            </View>
          )}
        </>
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
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing["2xl"],
    borderWidth: 1,
    borderColor: colors.brand[200],
    ...shadows.card,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  heroCopy: {
    flex: 1,
    marginRight: spacing.lg,
  },
  heroTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.neutral[400],
    lineHeight: 20,
  },
  heroPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  heroMetric: {
    ...typography.heading,
    color: colors.brand[600],
    fontSize: 24,
  },
  heroMetricLabel: {
    ...typography.label,
    color: colors.neutral[400],
    fontSize: 10,
    textTransform: "uppercase",
  },
  primaryButton: {
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
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flexBasis: "30%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.heading,
    fontSize: 26,
    color: colors.neutral[100],
  },
  statLabel: {
    ...typography.label,
    color: colors.neutral[300],
    marginTop: spacing.xs,
  },
  statSubtitle: {
    ...typography.body,
    color: colors.neutral[500],
    fontSize: 12,
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    backgroundColor: colors.brand[400],
  },
  formCard: {
    gap: spacing.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    padding: spacing.md,
    color: colors.neutral[100],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  secondaryButton: {
    backgroundColor: colors.neutral[700],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.neutral[100],
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: colors.danger,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  sectionBlock: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
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
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["2xl"],
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: "center",
  },
  emptySection: {
    gap: spacing.lg,
  },
  suggestionsCard: {
    borderWidth: 1,
    borderColor: colors.brand[200],
    backgroundColor: colors.brand[50],
    gap: spacing.md,
  },
  suggestionsHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  suggestionsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.brand[100],
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  suggestionsTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.neutral[100],
  },
  suggestionsSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.neutral[400],
  },
  suggestionsList: {
    gap: spacing.md,
  },
  suggestionItem: {
    borderWidth: 1,
    borderColor: colors.brand[200],
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  suggestionContent: {
    gap: spacing.xs,
  },
  suggestionTitle: {
    ...typography.heading,
    fontSize: 16,
    color: colors.neutral[100],
  },
  suggestionDescription: {
    ...typography.body,
    fontSize: 13,
    color: colors.neutral[300],
    lineHeight: 18,
  },
  suggestionCategory: {
    alignSelf: "flex-start",
    backgroundColor: colors.brand[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
  },
  suggestionCategoryText: {
    ...typography.label,
    fontSize: 11,
    color: colors.brand[600],
    textTransform: "uppercase",
  },
  suggestionButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
  },
  suggestionButtonText: {
    ...typography.label,
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
});
