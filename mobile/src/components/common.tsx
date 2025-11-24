import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing, radii, shadows, typography } from '../theme/tokens';

export const Card: React.FC<ViewProps> = ({ style, ...props }) => {
  return <View style={[styles.card, style]} {...props} />;
};

interface SectionProps extends ViewProps {
  title: string;
  subtitle?: string;
}

export const Section: React.FC<SectionProps> = ({ title, subtitle, children, style }) => {
  return (
    <Card style={style}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {children && <View style={styles.sectionContent}>{children}</View>}
    </Card>
  );
};

import { DimensionValue } from 'react-native';

interface SkeletonProps {
  height: number;
  width?: DimensionValue;
  style?: ViewProps['style'];
}

export const Skeleton: React.FC<SkeletonProps> = ({ height, width = '100%', style }) => {
  return <View style={[styles.skeleton, { height, width }, style]} />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[600],
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
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
  sectionContent: {
    marginTop: spacing.md,
  },
  skeleton: {
    backgroundColor: colors.neutral[700],
    borderRadius: radii.sm,
  },
});
