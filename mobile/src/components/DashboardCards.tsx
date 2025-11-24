import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';
import { Card } from './common';

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, description }) => {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDescription}>{description}</Text>
    </Card>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  onPress: () => void;
  buttonText: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({ title, description, onPress, buttonText }) => {
  return (
    <Card style={styles.actionCard}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <Text style={styles.actionButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.label,
    color: colors.neutral[400],
    textTransform: 'uppercase',
  },
  statValue: {
    ...typography.heading,
    fontSize: 36,
    color: colors.neutral[100],
    marginVertical: spacing.sm,
  },
  statDescription: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  actionCard: {
    flex: 1,
  },
  actionTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.neutral[100],
  },
  actionDescription: {
    ...typography.body,
    color: colors.neutral[400],
    marginVertical: spacing.md,
    flexGrow: 1,
  },
  actionButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.label,
    color: colors.surface,
  },
});
