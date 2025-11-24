import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchGoals, createGoal, updateGoalStatus, Goal } from '../api/goals';
import { useAuthStore } from '../store/auth';
import { colors, spacing, typography, radii } from '../theme/tokens';
import { Card } from '../components/common';
import { GoalCard } from '../components/GoalCard';
import { PageHeading } from '../components/PageHeading';

export default function GoalsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch (err) {
      setError('Failed to load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadGoals();
    }
  }, [isAuthenticated, router, loadGoals]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals().finally(() => setRefreshing(false));
  }, [loadGoals]);

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) {
      setError('Title is required.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      await createGoal(newGoal);
      setNewGoal({ title: '', description: '', target_date: '' });
      setShowCreateForm(false);
      loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create goal.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await updateGoalStatus(goalId, 'completed');
      loadGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete goal.');
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

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
        title="Relationship Goals"
        description="Set shared goals to strengthen your partnership."
        actions={
          <TouchableOpacity style={styles.button} onPress={() => setShowCreateForm(!showCreateForm)}>
            <Text style={styles.buttonText}>{showCreateForm ? 'Cancel' : 'New Goal'}</Text>
          </TouchableOpacity>
        }
      />

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {showCreateForm && (
        <Card>
          <Text style={styles.sectionTitle}>Create New Goal</Text>
          <TextInput
            style={styles.input}
            placeholder="Goal Title"
            placeholderTextColor={colors.neutral[400]}
            value={newGoal.title}
            onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.neutral[400]}
            value={newGoal.description}
            onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
            multiline
          />
          <TouchableOpacity
            style={[styles.button, isCreating && styles.buttonDisabled]}
            onPress={handleCreateGoal}
            disabled={isCreating}
          >
            <Text style={styles.buttonText}>{isCreating ? 'Creating...' : 'Create Goal'}</Text>
          </TouchableOpacity>
        </Card>
      )}

      {goals.length === 0 && !showCreateForm && (
        <Card>
          <Text style={styles.emptyText}>No goals yet. Create one to get started!</Text>
        </Card>
      )}

      {activeGoals.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => router.push(`/goals/${goal.id}`)}
              onComplete={() => handleCompleteGoal(goal.id)}
            />
          ))}
        </View>
      )}

      {completedGoals.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={styles.sectionTitle}>Completed Goals</Text>
          {completedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => router.push(`/goals/${goal.id}`)}
              onComplete={() => {}}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

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
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  buttonDisabled: {
    backgroundColor: colors.brand[400],
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    padding: spacing.md,
    color: colors.neutral[100],
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
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
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: 'center',
    padding: spacing.lg,
  },
});