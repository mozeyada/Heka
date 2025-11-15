import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { colors, spacing, typography, radii, shadows } from '../theme/tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId] = useState('mobile-demo-device'); // TODO: replace with actual device identifier
  const { login, loading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login(email.trim().toLowerCase(), password, deviceId);
      // TODO: navigate to dashboard (to be implemented)
    } catch (err) {
      console.log('Login failed', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.brand[800], colors.brand[900]]}
        style={styles.hero}
      >
        <Text style={styles.badge}>HEKA</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue guiding couples toward resolution.
        </Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.neutral[400]}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.neutral[400]}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.neutral[800]} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[25],
  },
  hero: {
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    ...shadows.card,
  },
  badge: {
    color: colors.brand[200],
    fontWeight: '600',
    letterSpacing: 4,
    fontSize: 12,
  },
  title: {
    marginTop: spacing.md,
    color: colors.neutral[800],
    fontSize: typography.heading.fontSize,
    fontFamily: typography.heading.fontFamily,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.neutral[600],
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  form: {
    marginTop: -spacing.xl,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  label: {
    color: colors.neutral[600],
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    lineHeight: typography.label.lineHeight,
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.neutral[700],
    backgroundColor: colors.neutral[25],
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: 14,
  },
  button: {
    marginTop: spacing.lg,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.brand[300],
  },
  buttonText: {
    color: colors.neutral[800],
    fontSize: 16,
    fontWeight: '600',
  },
});

