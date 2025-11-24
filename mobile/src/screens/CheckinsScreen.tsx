import { useEffect, useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { getCurrentCheckin, completeCheckin } from '../api/checkins';
import { useAuthStore } from '../store/auth';
import { colors, spacing, typography, radii } from '../theme/tokens';
import { Card } from '../components/common';
import { PageHeading } from '../components/PageHeading';

export default function CheckinScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checkin, setCheckin] = useState<any>(null);
  const [responses, setResponses] = useState({ question1: '', question2: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError('Failed to load check-in.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadCheckin();
    }
  }, [isAuthenticated, router, loadCheckin]);

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
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand[500]} />}
    >
      <PageHeading
        title="Weekly Check-in"
        description="A quick pulse on your relationship health."
      />

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {checkin?.status === 'completed' ? (
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

const CheckinForm = ({ responses, setResponses, onSubmit, isSubmitting }: any) => (
  <Card>
    <Text style={styles.questionLabel}>1. How are you feeling about communication this week?</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      placeholder="Share your thoughts openly…"
      placeholderTextColor={colors.neutral[400]}
      value={responses.question1}
      onChangeText={(text) => setResponses({ ...responses, question1: text })}
      multiline
    />

    <Text style={styles.questionLabel}>2. Rate your relationship satisfaction (1-10) and explain why?</Text>
    <TextInput
      style={[styles.input, styles.textArea]}
      placeholder="Rate from 1–10 and share context…"
      placeholderTextColor={colors.neutral[400]}
      value={responses.question2}
      onChangeText={(text) => setResponses({ ...responses, question2: text })}
      multiline
    />

    <TouchableOpacity
      style={[styles.button, isSubmitting && styles.buttonDisabled]}
      onPress={onSubmit}
      disabled={isSubmitting}
    >
      <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit Check-in'}</Text>
    </TouchableOpacity>
  </Card>
);

const CompletedCheckinView = ({ checkin }: any) => (
  <Card>
    <View style={styles.completedHeader}>
      <Text style={styles.completedTitle}>Check-in Completed!</Text>
      <Text style={styles.completedDate}>
        Submitted on {new Date(checkin.completed_at).toLocaleDateString()}
      </Text>
    </View>

    <View style={styles.responseCard}>
      <Text style={styles.questionLabel}>How are you feeling about communication this week?</Text>
      <Text style={styles.responseText}>{checkin.responses.question1}</Text>
    </View>

    <View style={styles.responseCard}>
      <Text style={styles.questionLabel}>Rate your relationship satisfaction (1-10) and why?</Text>
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
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  button: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  buttonDisabled: {
    backgroundColor: colors.brand[400],
  },
  questionLabel: {
    ...typography.label,
    color: colors.neutral[200],
    marginBottom: spacing.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    padding: spacing.md,
    color: colors.neutral[100],
    marginBottom: spacing.lg,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.danger,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[700],
  },
  completedTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.success,
  },
  completedDate: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.sm,
  },
  responseCard: {
    marginBottom: spacing.lg,
  },
  responseText: {
    ...typography.body,
    color: colors.neutral[200],
    marginTop: spacing.sm,
  },
});