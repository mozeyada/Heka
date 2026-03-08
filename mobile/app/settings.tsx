import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Note: For mobile, we'll show the data in an Alert or copy to clipboard
// Full file export would require expo-file-system and expo-sharing
import { exportUserData, deleteAccount } from "../src/api/users";
import { PageHeading } from "../src/components/PageHeading";
import { Card, Section } from "../src/components/common";
import { useAuthStore } from "../src/store/auth";
import {
  colors,
  spacing,
  typography,
  radii,
} from "../src/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleExportData = async () => {
    try {
      setExporting(true);
      setError(null);
      const data = await exportUserData();

      // For mobile, show the data in an alert with option to copy
      // In production, you might want to use expo-file-system + expo-sharing
      const jsonString = JSON.stringify(data.data, null, 2);

      Alert.alert(
        "Data Export Ready",
        "Your data export is ready. The data has been prepared and can be accessed via the web version for full file download, or you can view it here.",
        [
          {
            text: "View Data",
            onPress: () => {
              // Show in a scrollable view or copy to clipboard
              Alert.alert(
                "Export Data",
                `Data size: ${(jsonString.length / 1024).toFixed(2)} KB\n\nFor full file download, please use the web version at heka.app/settings`,
                [{ text: "OK" }],
              );
            },
          },
          { text: "OK" },
        ],
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to export data";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      Alert.alert("Error", "Please type DELETE to confirm account deletion");
      return;
    }

    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This will permanently delete your account, couple profile, and all stored data. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              setError(null);
              await deleteAccount("DELETE");
              logout();
              router.replace("/");
            } catch (err: any) {
              const errorMessage =
                err.response?.data?.detail ||
                err.message ||
                "Failed to delete account";
              setError(errorMessage);
              setDeleting(false);
              setShowDeleteConfirm(false);
              Alert.alert("Error", errorMessage);
            }
          },
        },
      ],
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <PageHeading
          title="Settings"
          description="Manage your account, export your data, or delete your profile."
        />

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Account Overview */}
        <Section
          title="Account Overview"
          subtitle={user.email}
        >
          <Card>
            <View style={styles.accountInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              {user.name && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
              )}
            </View>
          </Card>
        </Section>

        {/* Export Data */}
        <Section
          title="Export Your Data"
          subtitle="Download a complete copy of your arguments, perspectives, and insights in JSON format."
        >
          <TouchableOpacity
            style={[
              styles.button,
              styles.exportButton,
              exporting && styles.buttonDisabled,
            ]}
            onPress={handleExportData}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <>
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={colors.surface}
                />
                <Text style={styles.buttonText}>Export Data</Text>
              </>
            )}
          </TouchableOpacity>
        </Section>

        {/* Danger Zone */}
        <Section
          title="Danger Zone"
          subtitle="Permanently delete your account and all stored data. This action cannot be undone."
        >
          {!showDeleteConfirm ? (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <Text style={[styles.buttonText, styles.deleteButtonText]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          ) : (
            <Card style={styles.deleteConfirmCard}>
              <Text style={styles.deleteConfirmText}>
                Type <Text style={styles.deleteConfirmBold}>DELETE</Text> to
                confirm:
              </Text>
              <TextInput
                style={styles.deleteInput}
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
                placeholder="DELETE"
                placeholderTextColor={colors.neutral[400]}
                autoCapitalize="characters"
              />
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmDeleteButton,
                    deleting && styles.buttonDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== "DELETE"}
                >
                  {deleting ? (
                    <ActivityIndicator color={colors.surface} />
                  ) : (
                    <Text style={styles.buttonText}>Confirm Deletion</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation("");
                  }}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: colors.danger,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  accountInfo: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    ...typography.label,
    color: colors.neutral[400],
  },
  infoValue: {
    ...typography.body,
    color: colors.neutral[100],
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  exportButton: {
    backgroundColor: colors.neutral[800],
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  confirmDeleteButton: {
    backgroundColor: colors.danger,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.neutral[600],
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  deleteButtonText: {
    color: colors.danger,
  },
  cancelButtonText: {
    color: colors.neutral[200],
  },
  deleteConfirmCard: {
    marginTop: spacing.md,
    borderColor: colors.danger,
    borderWidth: 1,
  },
  deleteConfirmText: {
    ...typography.body,
    color: colors.neutral[200],
    marginBottom: spacing.md,
  },
  deleteConfirmBold: {
    fontWeight: "700",
    color: colors.neutral[100],
  },
  deleteInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.neutral[100],
    marginBottom: spacing.md,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 2,
  },
  deleteActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
