import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

interface PageHeadingProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeading: React.FC<PageHeadingProps> = ({ title, description, actions }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {actions}
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.heading,
    color: colors.neutral[100],
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.sm,
  },
});
