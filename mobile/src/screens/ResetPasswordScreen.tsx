import { Link, useLocalSearchParams, useRouter } from "expo-router";
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

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/reset-password", { 
        token, 
        new_password: password 
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password. The link might have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <Ionicons name="warning" size={48} color={colors.warning} style={{ marginBottom: spacing.md }}/>
        <Text style={styles.successTitle}>Invalid Link</Text>
        <Text style={styles.successText}>The password reset link is missing or invalid.</Text>
        <Link href="/forgot-password" asChild>
          <TouchableOpacity style={[styles.button, { marginTop: spacing.xl, paddingHorizontal: spacing.xl }]}>
            <Text style={styles.buttonText}>Request New Link</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

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
        <Text style={styles.title}>Create New Password</Text>
        {!isSuccess && (
          <Text style={styles.subtitle}>
            Please enter your new password below.
          </Text>
        )}
      </LinearGradient>

      <View style={styles.form}>
        {isSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="shield-checkmark" size={48} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>Password Updated</Text>
            <Text style={styles.successText}>
              Your password has been successfully reset.
            </Text>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.fullButton}>
                <Text style={styles.buttonText}>Log In Now</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={password}
              onChangeText={setPassword}
            />

            <Text style={[styles.label, { marginTop: spacing.md }]}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.neutral[400]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (!password || !confirmPassword || loading) && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={!password || !confirmPassword || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.neutral[800]} />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[25] },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  hero: { paddingTop: spacing.xl * 2, paddingBottom: spacing.xl * 1.5, paddingHorizontal: spacing.xl, borderBottomLeftRadius: radii.xl, borderBottomRightRadius: radii.xl, ...shadows.card },
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
  successContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  successIcon: { marginBottom: spacing.md },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: colors.neutral[800], marginBottom: spacing.sm },
  successText: { fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginBottom: spacing.xl }
});
