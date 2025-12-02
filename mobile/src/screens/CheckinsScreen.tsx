import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentCheckin, completeCheckin } from '../api/checkins';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';
import { Card } from '../components/common';
import { PageHeading } from '../components/PageHeading';

export default function CheckinScreen() {
  const router = useRouter();
  const [checkin, setCheckin] = useState<any>(null);
  const [responses, setResponses] = useState({ question1: '', question2: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const isCompleted = checkin?.status === 'completed';
  const submittedDate = checkin?.completed_at ? new Date(checkin.completed_at).toLocaleDateString() : null;
  const insets = useSafeAreaInsets();
  const contentContainerStyle = useMemo(
    () => [styles.container, { paddingTop: spacing.lg + insets.top }],
    [insets.top]
  );

  const loadCheckin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentCheckin();
      setCheckin(data);
      if (data.responses) {
        setResponses({
          question1: data.responses.question1 || '',
          question2: data.responses.question2 || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load check-in.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // No need to check auth here - we're already in protected (tabs) route
    loadCheckin();
  }, [loadCheckin]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCheckin().finally(() => setRefreshing(false));
  }, [loadCheckin]);

  const handleSubmit = async () => {
    if (!responses.question1.trim() || !responses.question2.trim()) {
      setError('Please answer both questions.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await completeCheckin(responses);
      loadCheckin(); // Reload to show completed state
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={contentContainerStyle}
      contentInsetAdjustmentBehavior="always"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <PageHeading
        title="Weekly Check-in"
        description="A quick pulse on your relationship health."
      />

      <LinearGradient
        colors={[colors.brand[50], colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{isCompleted ? 'Check-in locked in' : 'Ready for reflection'}</Text>
            <Text style={styles.heroSubtitle}>
              {isCompleted
                ? 'Review your partner pulse and plan the next session.'
                : 'Answer two guided prompts to keep your connection aligned.'}
            </Text>
          </View>
          <View style={[styles.statusPill, isCompleted ? styles.statusPillSuccess : styles.statusPillPending]}>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'time-outline'}
              size={16}
              color={isCompleted ? colors.success : colors.warning}
            />
            <Text style={[styles.statusPillText, isCompleted ? styles.statusPillTextSuccess : styles.statusPillTextPending]}>
              {isCompleted ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
        <View style={styles.heroMetaRow}>
          <View style={styles.heroMetaItem}>
            <Text style={styles.metaLabel}>Due Every</Text>
            <Text style={styles.metaValue}>Sunday</Text>
          </View>
          <View style={styles.heroMetaItem}>
            <Text style={styles.metaLabel}>{isCompleted ? 'Submitted' : 'Last session'}</Text>
            <Text style={styles.metaValue}>{submittedDate ?? 'Awaiting'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
          activeOpacity={0.85}
        >
          <Ionicons name={isCompleted ? 'document-text-outline' : 'sparkles'} size={18} color={colors.surface} />
          <Text style={styles.primaryButtonText}>{isCompleted ? 'Review Responses' : 'Start Check-in'}</Text>
        </TouchableOpacity>
      </LinearGradient>

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {isCompleted ? (
        <CompletedCheckinView checkin={checkin} />
      ) : (
        <CheckinForm
          responses={responses}
          setResponses={setResponses}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </ScrollView>
  );
}

const CheckinForm = ({ responses, setResponses, onSubmit, isSubmitting }: any) => {
  const prompts = [
    {
      key: 'question1',
      label: 'How are you feeling about communication this week?',
      placeholder: 'Share your thoughts openly…',
    },
    {
      key: 'question2',
      label: 'Rate your relationship satisfaction (1-10) and explain why?',
      placeholder: 'Rate from 1–10 and share context…',
    },
  ] as const;

  return (
    <Card style={styles.formCard}>
      {prompts.map((prompt, index) => (
        <View key={prompt.key} style={styles.promptBlock}>
          <View style={styles.promptHeading}>
            <Text style={styles.promptIndex}>{index + 1}</Text>
            <Text style={styles.promptLabel}>{prompt.label}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={prompt.placeholder}
            placeholderTextColor={colors.neutral[400]}
            value={(responses as any)[prompt.key]}
            onChangeText={(text) => setResponses({ ...responses, [prompt.key]: text })}
            multiline
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.secondaryButton, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.secondaryButtonText}>{isSubmitting ? 'Submitting…' : 'Submit Check-in'}</Text>
      </TouchableOpacity>
    </Card>
  );
};

const CompletedCheckinView = ({ checkin }: any) => (
  <Card style={styles.formCard}>
    <View style={styles.completedHeader}>
      <View>
        <Text style={styles.completedTitle}>Check-in Complete</Text>
        <Text style={styles.completedDate}>Submitted on {new Date(checkin.completed_at).toLocaleDateString()}</Text>
      </View>
      <View style={[styles.statusPill, styles.statusPillSuccess]}>
        <Ionicons name="checkmark" size={14} color={colors.success} />
        <Text style={[styles.statusPillText, styles.statusPillTextSuccess]}>Aligned</Text>
      </View>
    </View>

    <View style={styles.responseCard}>
      <Text style={styles.promptLabel}>How are you feeling about communication this week?</Text>
      <Text style={styles.responseText}>{checkin.responses.question1}</Text>
    </View>

    <View style={styles.responseCard}>
      <Text style={styles.promptLabel}>Rate your relationship satisfaction (1-10) and why?</Text>
      <Text style={styles.responseText}>{checkin.responses.question2}</Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
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
    marginBottom: spacing.lg,
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statusPillSuccess: {
    backgroundColor: `${colors.success}15`,
    borderColor: `${colors.success}40`,
  },
  statusPillPending: {
    backgroundColor: `${colors.warning}15`,
    borderColor: `${colors.warning}40`,
  },
  statusPillText: {
    ...typography.label,
    fontSize: 12,
  },
  statusPillTextSuccess: {
    color: colors.success,
  },
  statusPillTextPending: {
    color: colors.warning,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  primaryButton: {
    backgroundColor: colors.brand[600],
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
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
  formCard: {
    gap: spacing.lg,
  },
  promptBlock: {
    gap: spacing.sm,
  },
  promptHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  promptIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[700],
    textAlign: 'center',
    textAlignVertical: 'center',
    ...typography.label,
    color: colors.neutral[300],
  },
  promptLabel: {
    ...typography.label,
    color: colors.neutral[200],
    flex: 1,
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
    minHeight: 110,
    textAlignVertical: 'top',
  },
  secondaryButton: {
    backgroundColor: colors.neutral[700],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.surface,
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
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },
  completedTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  completedDate: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  responseCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  responseText: {
    ...typography.body,
    color: colors.neutral[200],
    marginTop: spacing.sm,
  },
});