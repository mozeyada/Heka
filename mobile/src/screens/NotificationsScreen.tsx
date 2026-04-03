import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  fetchNotifications,
  InAppNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { PageHeading } from "../components/PageHeading";
import { Card } from "../components/common";
import { colors, radii, shadows, spacing, typography } from "../theme/tokens";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-AU", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotifications(50, 0);
      setItems(data.items || []);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  const handleOpen = async (item: InAppNotification) => {
    try {
      if (!item.is_read) {
        await markNotificationRead(item.id);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? { ...entry, is_read: true, read_at: new Date().toISOString() }
              : entry,
          ),
        );
      }
    } catch {
      // Do not block navigation on read errors.
    }

    if (item.action_path) {
      router.push(item.action_path as any);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setItems((current) =>
        current.map((entry) => ({
          ...entry,
          is_read: true,
          read_at: entry.read_at || new Date().toISOString(),
        })),
      );
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items],
  );

  const contentContainerStyle = useMemo(
    () => [
      styles.container,
      { paddingTop: spacing.lg + insets.top, paddingBottom: 110 },
    ],
    [insets.top],
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={contentContainerStyle}
      contentInsetAdjustmentBehavior="always"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand[500]}
        />
      }
    >
      <PageHeading
        title="Notifications"
        description="Low-detail relationship signals that bring you back into the right part of the app."
        actions={
          <TouchableOpacity
            style={[
              styles.headerAction,
              (markingAll || unreadCount === 0) && styles.headerActionDisabled,
            ]}
            onPress={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
          >
            <Text style={styles.headerActionText}>
              {markingAll
                ? "Marking..."
                : unreadCount > 0
                  ? `Read all (${unreadCount})`
                  : "All read"}
            </Text>
          </TouchableOpacity>
        }
      />

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      {items.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.neutral[300]}
          />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyBody}>
            Archive events and other partner signals will appear here.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => handleOpen(item)}
            >
              <Card style={item.is_read ? styles.itemCard : styles.unreadCard}>
                <View style={styles.itemRow}>
                  <View
                    style={[
                      styles.dot,
                      item.is_read ? styles.dotRead : styles.dotUnread,
                    ]}
                  />
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {!item.is_read && (
                        <View style={styles.newPill}>
                          <Text style={styles.newPillText}>NEW</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemBody}>{item.body}</Text>
                    <Text style={styles.itemMeta}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.neutral[500]}
                  />
                </View>
              </Card>
            </TouchableOpacity>
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
    gap: spacing.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
  },
  headerAction: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  headerActionDisabled: {
    opacity: 0.5,
  },
  headerActionText: {
    ...typography.label,
    color: colors.brand[600],
  },
  errorCard: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  emptyBody: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: "center",
    maxWidth: 280,
  },
  list: {
    gap: spacing.md,
  },
  itemCard: {
    borderColor: colors.neutral[700],
  },
  unreadCard: {
    borderColor: colors.brand[300],
    backgroundColor: colors.brand[50],
    ...shadows.card,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  dotRead: {
    backgroundColor: colors.neutral[500],
  },
  dotUnread: {
    backgroundColor: colors.brand[500],
  },
  itemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemTitle: {
    ...typography.label,
    color: colors.neutral[100],
    flexShrink: 1,
  },
  itemBody: {
    ...typography.body,
    color: colors.neutral[300],
  },
  itemMeta: {
    ...typography.label,
    fontSize: 11,
    color: colors.neutral[500],
    textTransform: "uppercase",
  },
  newPill: {
    backgroundColor: colors.brand[600],
    borderRadius: radii.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  newPillText: {
    ...typography.label,
    fontSize: 10,
    color: colors.surface,
  },
});
