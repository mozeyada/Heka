import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { fetchArgument } from '../api/arguments';
import { submitPerspective } from '../api/perspectives';
import { colors, spacing, radii, typography, shadows } from '../theme/tokens';

type Props = {
  argumentId?: string;
};

export default function ArgumentDetailScreen({ argumentId }: Props) {
  const [argument, setArgument] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [perspective, setPerspective] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadArgument = async () => {
    if (!argumentId) return;
    setLoading(true);
    try {
      const detail = await fetchArgument(argumentId);
      setArgument(detail);
    } catch (error) {
      console.log('Failed to load argument detail', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArgument();
  }, [argumentId]);

  const handleSubmitPerspective = async () => {
    if (!argumentId || !perspective.trim()) return;
    setSubmitting(true);
    try {
      await submitPerspective(argumentId, perspective.trim());
      setPerspective('');
      await loadArgument();
    } catch (error) {
      console.log('Failed to submit perspective', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !argument) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loaderText}>Loading argument…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{argument.title}</Text>
        <Text style={styles.meta}>
          {argument.status} • {argument.priority} • {argument.category}
        </Text>
        <Text style={styles.meta}>Created: {argument.created_at}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Your Perspective</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your thoughts…"
          placeholderTextColor={colors.neutral[300]}
          multiline
          numberOfLines={4}
          value={perspective}
          onChangeText={setPerspective}
        />
        <TouchableOpacity
          style={[styles.button, (!perspective.trim() || submitting) && styles.buttonDisabled]}
          disabled={!perspective.trim() || submitting}
          onPress={handleSubmitPerspective}
        >
          <Text style={styles.buttonText}>{submitting ? 'Sending…' : 'Submit Perspective'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.lg,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  loaderText: {
    marginTop: spacing.md,
    color: colors.neutral[400],
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  title: {
    color: colors.neutral[100],
    fontSize: typography.body.fontSize + 4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.neutral[400],
    fontSize: 14,
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.neutral[100],
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 120,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    backgroundColor: colors.surfaceMuted,
    color: colors.neutral[100],
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.brand[300],
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
  },
});

