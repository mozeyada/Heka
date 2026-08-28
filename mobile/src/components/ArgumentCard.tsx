import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Card } from "./common";
import { Argument } from "../models/argument";
import { colors, spacing, typography, radii } from "../theme/tokens";

interface ArgumentCardProps {
  argument: Argument;
  onPress: () => void;
}

export const ArgumentCard: React.FC<ArgumentCardProps> = ({
  argument,
  onPress,
}) => {
  const stateLabel = argument.status === "archived"
    ? "Archived"
    : argument.needs_user_response
    ? "Reply needed"
    : argument.can_generate_insight
      ? "Ready for insight"
      : argument.insight_status === "current"
        ? "Insight current"
        : "Waiting on partner";

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{argument.title}</Text>
          <View
            style={[styles.priorityPill, getPriorityStyle(argument.priority)]}
          >
            <Text
              style={[
                styles.priorityText,
                getPriorityTextStyle(argument.priority),
              ]}
            >
              {argument.priority}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {argument.status} • {argument.category}
        </Text>
        <View style={styles.footerRow}>
          <View
            style={[
              styles.statePill,
              argument.status === "archived"
                ? styles.statePillArchived
                : argument.needs_user_response
                  ? styles.statePillWarning
                : argument.can_generate_insight
                  ? styles.statePillReady
                  : argument.insight_status === "current"
                    ? styles.statePillCurrent
                    : styles.statePillWaiting,
            ]}
          >
            <Text style={styles.statePillText}>{stateLabel}</Text>
          </View>
          <Text style={styles.metaHint}>
            {argument.needs_user_response
              ? "Your partner is waiting on you."
              : argument.status === "archived"
                ? "Your partner stepped away from this issue."
              : argument.can_generate_insight
                ? "Both sides are in."
                : "Open to continue."}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const PRIORITY_MAP: Record<string, { background: string; text: string }> = {
  urgent: { background: "#fee2e2", text: "#b91c1c" },
  high: { background: "#ffedd5", text: "#c2410c" },
  medium: { background: "#dbeafe", text: "#1d4ed8" },
  low: { background: "#e2e8f0", text: "#1f2937" },
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
  card: {
    marginBottom: spacing.lg,
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
    color: colors.neutral[900],
    flex: 1,
  },
  meta: {
    ...typography.body,
    color: colors.neutral[600],
  },
  footerRow: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  priorityPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
  },
  priorityText: {
    ...typography.label,
    fontSize: 12,
  },
  statePill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
  },
  statePillWarning: {
    backgroundColor: "#fff7ed",
  },
  statePillReady: {
    backgroundColor: "#ecfeff",
  },
  statePillCurrent: {
    backgroundColor: "#ecfdf5",
  },
  statePillWaiting: {
    backgroundColor: "#eff6ff",
  },
  statePillArchived: {
    backgroundColor: "#f4f4f5",
  },
  statePillText: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[900],
  },
  metaHint: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[600],
  },
});
