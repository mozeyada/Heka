import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createArgument } from '../api/arguments';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';
import { Card } from '../components/common';
import { PageHeading } from '../components/PageHeading';

export default function CreateArgumentScreen() {
  const router = useRouter();
  const [newArgument, setNewArgument] = useState({ title: '', category: 'communication', priority: 'medium' });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categoryOptions = [
    { label: 'Communication', value: 'communication' },
    { label: 'Values & Beliefs', value: 'values' },
    { label: 'Trust & Safety', value: 'trust' },
    { label: 'Finances', value: 'finances' },
  ];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'] as const;
  const selectedCategoryLabel =
    categoryOptions.find((option) => option.value === newArgument.category)?.label ?? 'General';
  const insets = useSafeAreaInsets();

  const handleCreateArgument = async () => {
    if (!newArgument.title.trim()) {
      setError('Title is required.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const created = await createArgument(newArgument);
      router.push(`/arguments/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create argument.');
    } finally {
      setIsCreating(false);
    }
  };

  // No need to check auth here - navigation guard handles it

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: spacing.lg + insets.top }]}
      contentInsetAdjustmentBehavior="always"
    >
      <PageHeading
        title="New Argument"
        description="Capture context before inviting AI to help mediate."
      />

      <LinearGradient
        colors={[colors.brand[50], colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Intake in minutes</Text>
            <Text style={styles.heroSubtitle}>
              A focused prompt helps both of you stay objective when emotions are high.
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={22} color={colors.brand[600]} />
          </View>
        </View>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaItem}>
            <Text style={styles.metaLabel}>Priority</Text>
            <Text style={styles.metaValue}>{newArgument.priority}</Text>
          </View>
          <View style={styles.heroMetaItem}>
            <Text style={styles.metaLabel}>Category</Text>
            <Text style={styles.metaValue}>{selectedCategoryLabel}</Text>
          </View>
        </View>
      </LinearGradient>

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      <Card style={styles.formCard}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Household Chores"
          placeholderTextColor={colors.neutral[400]}
          value={newArgument.title}
          onChangeText={(text) => setNewArgument({ ...newArgument, title: text })}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categoryOptions.map((option) => {
            const isActive = newArgument.category === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setNewArgument((prev) => ({ ...prev, category: option.value }))}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.chipRow}>
          {priorityOptions.map((priority) => {
            const isActive = newArgument.priority === priority;
            return (
              <TouchableOpacity
                key={priority}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setNewArgument((prev) => ({ ...prev, priority }))}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{priority}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isCreating && styles.buttonDisabled]}
          onPress={handleCreateArgument}
          disabled={isCreating}
        >
          <Ionicons name={isCreating ? 'time-outline' : 'paper-plane-outline'} size={16} color={colors.surface} />
          <Text style={styles.primaryButtonText}>{isCreating ? 'Saving...' : 'Create Argument'}</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.brand[200],
    ...shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  heroCopy: {
    flex: 1,
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
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  heroMetaItem: {
    flex: 1,
  },
  metaLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[400],
    textTransform: 'uppercase',
  },
  metaValue: {
    ...typography.heading,
    fontSize: 18,
    color: colors.neutral[100],
    marginTop: spacing.xs,
  },
  formCard: {
    gap: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.neutral[200],
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.brand[600],
    backgroundColor: `${colors.brand[600]}15`,
  },
  chipText: {
    ...typography.label,
    fontSize: 12,
    color: colors.neutral[300],
  },
  chipTextActive: {
    color: colors.brand[600],
  },
  primaryButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    ...typography.label,
    color: colors.surface,
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
});