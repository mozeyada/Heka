import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createArgument } from '../api/arguments';
import { useAuthStore } from '../store/auth';
import { colors, spacing, typography, radii } from '../theme/tokens';
import { Card } from '../components/common';
import { PageHeading } from '../components/PageHeading';

export default function CreateArgumentScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [newArgument, setNewArgument] = useState({ title: '', category: 'general', priority: 'medium' });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateArgument = async () => {
    if (!newArgument.title.trim()) {
      setError('Title is required.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const created = await createArgument(newArgument);
      router.push(`/argument?id=${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create argument.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <PageHeading
        title="New Argument"
        description="Start by defining the topic of the argument."
      />

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Household Chores"
          placeholderTextColor={colors.neutral[400]}
          value={newArgument.title}
          onChangeText={(text) => setNewArgument({ ...newArgument, title: text })}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., general"
          placeholderTextColor={colors.neutral[400]}
          value={newArgument.category}
          onChangeText={(text) => setNewArgument({ ...newArgument, category: text })}
        />

        <Text style={styles.label}>Priority</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., medium"
          placeholderTextColor={colors.neutral[400]}
          value={newArgument.priority}
          onChangeText={(text) => setNewArgument({ ...newArgument, priority: text })}
        />

        <TouchableOpacity
          style={[styles.button, isCreating && styles.buttonDisabled]}
          onPress={handleCreateArgument}
          disabled={isCreating}
        >
          <Text style={styles.buttonText}>{isCreating ? 'Creating...' : 'Create Argument'}</Text>
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
  label: {
    ...typography.label,
    color: colors.neutral[200],
    marginBottom: spacing.sm,
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
});