import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../api/client";
import { colors, spacing, typography, radii, shadows } from "../theme/tokens";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim().toLowerCase() });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.brand[800], colors.brand[900]]}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[25]} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        {!isSuccess && (
          <Text style={styles.subtitle}>
            Enter your email to receive a reset link.
          </Text>
        )}
      </LinearGradient>

      <View style={styles.form}>
        {isSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              If an account exists, we've sent password reset instructions.
            </Text>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.fullButton}>
                <Text style={styles.buttonText}>Return to Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Email Address</Text>
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

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (!email.trim() || loading) && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={!email.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.neutral[800]} />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[25] },
  hero: { 
    paddingTop: spacing.xl * 2, 
    paddingBottom: spacing.xl * 1.5, 
    paddingHorizontal: spacing.xl, 
    borderBottomLeftRadius: radii.xl, 
    borderBottomRightRadius: radii.xl, 
    ...shadows.card 
  },
  backButton: { marginBottom: spacing.md, width: 40, height: 40, justifyContent: 'center' },
  title: { color: colors.neutral[25], fontSize: typography.heading.fontSize, fontFamily: typography.heading.fontFamily, fontWeight: "700" },
  subtitle: { marginTop: spacing.sm, color: colors.neutral[200], fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight },
  form: { marginTop: -spacing.xl, marginHorizontal: spacing.xl, padding: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadows.card },
  label: { color: colors.neutral[600], fontFamily: typography.label.fontFamily, fontSize: typography.label.fontSize, lineHeight: typography.label.lineHeight, marginBottom: spacing.xs },
  input: { borderRadius: radii.md, borderWidth: 1, borderColor: colors.neutral[100], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.neutral[700], backgroundColor: colors.neutral[25] },
  error: { marginTop: spacing.sm, color: colors.danger, fontSize: 14 },
  button: { marginTop: spacing.lg, borderRadius: radii.lg, paddingVertical: spacing.md, backgroundColor: colors.brand[500], alignItems: "center", justifyContent: "center" },
  fullButton: { width: '100%', borderRadius: radii.lg, paddingVertical: spacing.md, backgroundColor: colors.brand[500], alignItems: "center", justifyContent: "center" },
  buttonDisabled: { backgroundColor: colors.brand[300] },
  buttonText: { color: colors.neutral[800], fontSize: 16, fontWeight: "600" },
  footer: { marginTop: spacing.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: colors.neutral[500], fontSize: 14 },
  loginLink: { color: colors.brand[600], fontSize: 14, fontWeight: '600' },
  successContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  successIcon: { marginBottom: spacing.md },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: colors.neutral[800], marginBottom: spacing.sm },
  successText: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginBottom: spacing.xl }
});
