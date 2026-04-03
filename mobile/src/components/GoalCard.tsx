import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Card } from "./common";
import { Goal } from "../models/goal";
import { colors, spacing, typography, radii } from "../theme/tokens";

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onComplete: () => void;
  onRemove: () => void;
  isCompleting?: boolean;
  isRemoving?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  onComplete,
  onRemove,
  isCompleting = false,
  isRemoving = false,
}) => {
  const isCompleted = goal.status === "completed";
  const isArchived = goal.status === "archived";

  return (
    <Card
      style={
        isArchived
          ? styles.archivedCard
          : isCompleted
            ? styles.completedCard
            : styles.card
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        {isCompleted && (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>✓ Completed</Text>
          </View>
        )}
        {isArchived && (
          <View style={styles.archivedPill}>
            <Text style={styles.archivedText}>Archived</Text>
          </View>
        )}
      </View>
      {goal.description && (
        <Text style={styles.description}>{goal.description}</Text>
      )}
      {!isCompleted && !isArchived && goal.next_action_title && (
        <View style={styles.nextActionBlock}>
          <View
            style={[
              styles.nextActionPill,
              goal.needs_user_progress
                ? styles.nextActionPillWarning
                : styles.nextActionPillReady,
            ]}
          >
            <Text style={styles.nextActionPillText}>
              {goal.needs_user_progress ? "Your move" : "Shared momentum"}
            </Text>
          </View>
          <Text style={styles.nextActionTitle}>{goal.next_action_title}</Text>
          {goal.next_action_description ? (
            <Text style={styles.nextActionDescription}>
              {goal.next_action_description}
            </Text>
          ) : null}
        </View>
      )}
      {(goal.latest_progress_note ||
        typeof goal.latest_progress_value === "number") && (
        <View style={styles.latestMoveBlock}>
          <Text style={styles.latestMoveLabel}>Latest shared move</Text>
          {goal.latest_progress_note ? (
            <Text style={styles.latestMoveNote}>
              {goal.latest_progress_note}
            </Text>
          ) : null}
          {typeof goal.latest_progress_value === "number" ? (
            <Text style={styles.latestMoveMeta}>
              Progress pulse {(goal.latest_progress_value * 100).toFixed(0)}%
            </Text>
          ) : null}
        </View>
      )}
      {goal.target_date && (
        <Text style={styles.date}>
          Target: {new Date(goal.target_date).toLocaleDateString()}
        </Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        {!isCompleted && !isArchived && (
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={onComplete}
            disabled={isCompleting || isRemoving}
          >
            <Text style={[styles.buttonText, styles.completeButtonText]}>
              {isCompleting ? "Completing..." : "Complete"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={onRemove}
          disabled={isCompleting || isRemoving}
        >
          <Text style={[styles.buttonText, styles.removeButtonText]}>
            {isRemoving ? "Removing..." : "Remove"}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  completedCard: {
    marginBottom: spacing.lg,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderColor: colors.success,
  },
  archivedCard: {
    marginBottom: spacing.lg,
    backgroundColor: "rgba(113, 113, 122, 0.08)",
    borderColor: colors.neutral[600],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
    fontSize: 18,
    color: colors.neutral[100],
    flex: 1,
  },
  statusPill: {
    backgroundColor: colors.success,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: {
    ...typography.label,
    fontSize: 12,
    color: colors.surface,
  },
  archivedPill: {
    backgroundColor: colors.neutral[700],
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  archivedText: {
    ...typography.label,
    fontSize: 12,
    color: colors.neutral[100],
  },
  description: {
    ...typography.body,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  nextActionBlock: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  nextActionPill: {
    alignSelf: "flex-start",
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  nextActionPillWarning: {
    backgroundColor: "#fff7ed",
  },
  nextActionPillReady: {
    backgroundColor: "#ecfeff",
  },
  nextActionPillText: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[100],
  },
  nextActionTitle: {
    ...typography.label,
    color: colors.neutral[100],
  },
  nextActionDescription: {
    ...typography.body,
    fontSize: 13,
    color: colors.neutral[400],
  },
  latestMoveBlock: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: spacing.xs,
  },
  latestMoveLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.neutral[400],
    textTransform: "uppercase",
  },
  latestMoveNote: {
    ...typography.body,
    fontSize: 13,
    color: colors.neutral[200],
  },
  latestMoveMeta: {
    ...typography.label,
    fontSize: 11,
    color: colors.brand[500],
  },
  date: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  buttonText: {
    ...typography.label,
    color: colors.neutral[200],
  },
  completeButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  completeButtonText: {
    color: colors.surface,
  },
  removeButton: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: colors.danger,
  },
  removeButtonText: {
    color: colors.danger,
  },
});
