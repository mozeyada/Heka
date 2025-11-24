import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Argument } from '../models/argument';
import { colors, spacing, typography, radii } from '../theme/tokens';
import { Card } from './common';

interface ArgumentCardProps {
  argument: Argument;
  onPress: () => void;
}

export const ArgumentCard: React.FC<ArgumentCardProps> = ({ argument, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{argument.title}</Text>
          <View style={[styles.priorityPill, getPriorityStyle(argument.priority)]}>
            <Text style={[styles.priorityText, getPriorityTextStyle(argument.priority)]}>
              {argument.priority}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {argument.status} • {argument.category}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};

const PRIORITY_MAP: Record<string, { background: string; text: string }> = {
  urgent: { background: '#fee2e2', text: '#b91c1c' },
  high: { background: '#ffedd5', text: '#c2410c' },
  medium: { background: '#dbeafe', text: '#1d4ed8' },
  low: { background: '#e2e8f0', text: '#1f2937' },
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
  meta: {
    ...typography.body,
    color: colors.neutral[400],
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
});
