import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Goal } from '../models/goal';
import { colors, spacing, typography, radii } from '../theme/tokens';
import { Card } from './common';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onComplete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onComplete }) => {
  const isCompleted = goal.status === 'completed';

  return (
    <Card style={isCompleted ? styles.completedCard : styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        {isCompleted && (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>✓ Completed</Text>
          </View>
        )}
      </View>
      {goal.description && <Text style={styles.description}>{goal.description}</Text>}
      {goal.target_date && (
        <Text style={styles.date}>Target: {new Date(goal.target_date).toLocaleDateString()}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        {!isCompleted && (
          <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={onComplete}>
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  description: {
    ...typography.body,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  date: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
});
