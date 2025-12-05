import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  fetchSubscription,
  fetchUsage,
  createCheckoutSession,
  Subscription,
  Usage,
} from "../src/api/subscriptions";
import { PageHeading } from "../src/components/PageHeading";
import { Card, Section } from "../src/components/common";
import {
  colors,
  spacing,
  typography,
  radii,
  shadows,
} from "../src/theme/tokens";

const PLAN_DESCRIPTIONS: Record<
  string,
  { headline: string; benefits: string[]; accent: string }
> = {
  free: {
    headline: "Starter Plan",
    benefits: [
      "5 guided mediations per month",
      "Weekly relationship pulse",
      "Foundational AI insights",
    ],
    accent: colors.brand[500],
  },
  basic: {
    headline: "Growth Plan",
    benefits: [
      "Unlimited mediations",
      "Shared journal & summaries",
      "Priority email support",
    ],
    accent: colors.success,
  },
  premium: {
    headline: "Premium Plan",
    benefits: [
      "Unlimited mediations + AI coaching",
      "Advanced analytics & reports",
      "Live session concierge",
    ],
    accent: colors.warning,
  },
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  return date.toLocaleDateString("en-AU", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingCheckout, setCreatingCheckout] = useState<
    "basic" | "premium" | null
  >(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [sub, usageData] = await Promise.all([
        fetchSubscription(),
        fetchUsage(),
      ]);
      setSubscription(sub);
      setUsage(usageData);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load subscription details.";
      setError(detail);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleUpgrade = async (tier: "basic" | "premium") => {
    try {
      setCreatingCheckout(tier);
      const returnUrl = Linking.createURL("/subscription");
      const { checkout_url } = await createCheckoutSession(tier, returnUrl);
      await Linking.openURL(checkout_url);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Unable to start upgrade flow.";
      Alert.alert("Upgrade Failed", detail);
    } finally {
      setCreatingCheckout(null);
    }
  };

  const getUsagePercentage = () => {
    if (!usage || usage.is_unlimited || usage.limit <= 0) {
      return 0;
    }
    return Math.min(Math.round((usage.usage_count / usage.limit) * 100), 100);
  };

  const renderBenefit = (benefit: string, index: number) => (
    <View key={`${benefit}-${index}`} style={styles.benefitRow}>
      <Ionicons name="checkmark-circle" size={18} color={colors.brand[500]} />
      <Text style={styles.benefitText}>{benefit}</Text>
    </View>
  );

  const planKey = subscription?.tier ?? "free";
  const planCopy = PLAN_DESCRIPTIONS[planKey] ?? PLAN_DESCRIPTIONS.free;
  const usagePercent = getUsagePercentage();

  if (loading && !subscription) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loadingText}>Fetching your subscription…</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[500]}
          />
        }
      >
        <PageHeading
          title="Subscription"
          description="Stay in sync as a couple, upgrade when you are ready, and keep an eye on usage."
        />

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {subscription && (
          <LinearGradient
            colors={[planCopy.accent, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroEyebrow}>Your plan</Text>
                <Text style={styles.heroTitle}>{planCopy.headline}</Text>
                <Text style={styles.heroSubtitle}>
                  Status: {subscription.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {subscription.tier.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.heroDates}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>Current period</Text>
                <Text style={styles.dateValue}>
                  Started {formatDate(subscription.current_period_start)}
                </Text>
                <Text style={styles.dateValue}>
                  Renews {formatDate(subscription.current_period_end)}
                </Text>
              </View>
              {subscription.trial_end && (
                <View style={styles.dateColumn}>
                  <Text style={styles.dateLabel}>Trial ends</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(subscription.trial_end)}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        )}

        {usage && (
          <Section
            title="Usage"
            subtitle={
              usage.is_unlimited
                ? "Unlimited guided sessions for this cycle"
                : "Stay within your monthly allowance"
            }
          >
            <Card style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageHeadline}>
                  {usage.is_unlimited
                    ? "Unlimited access unlocked"
                    : `${usage.usage_count} of ${usage.limit} sessions used`}
                </Text>
                {!usage.is_unlimited && (
                  <Text style={styles.usagePercentage}>{usagePercent}%</Text>
                )}
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${usage.is_unlimited ? 100 : usagePercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.usagePeriod}>
                {`Cycle resets ${formatDate(usage.period_end)} · Started ${formatDate(usage.period_start)}`}
              </Text>
            </Card>
          </Section>
        )}

        <Section title="Benefits" subtitle="Everything included with your plan">
          <Card>
            <View style={styles.benefitList}>
              {planCopy.benefits.map(renderBenefit)}
            </View>
          </Card>
        </Section>

        <Section
          title="Upgrade options"
          subtitle="Power up your relationship toolkit"
        >
          <View style={styles.upgradeGrid}>
            <Card style={styles.upgradeCard}>
              <View style={styles.upgradeHeader}>
                <Text style={styles.upgradeTitle}>Growth Plan</Text>
                <Text style={styles.upgradePrice}>$9.99/mo</Text>
              </View>
              <Text style={styles.upgradeCopy}>
                Unlock unlimited sessions and detailed AI summaries to stay
                aligned every week.
              </Text>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  creatingCheckout === "basic" && styles.upgradeButtonDisabled,
                ]}
                onPress={() => handleUpgrade("basic")}
                disabled={creatingCheckout === "basic"}
                activeOpacity={0.85}
              >
                {creatingCheckout === "basic" ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Ionicons
                      name="sparkles"
                      size={18}
                      color={colors.surface}
                    />
                    <Text style={styles.upgradeButtonText}>
                      Upgrade to Growth
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Card>

            <Card style={styles.upgradeCard}>
              <View style={styles.upgradeHeader}>
                <Text style={styles.upgradeTitle}>Premium Plan</Text>
                <Text style={styles.upgradePrice}>$19.99/mo</Text>
              </View>
              <Text style={styles.upgradeCopy}>
                Full concierge experience with proactive AI coaching, advanced
                analytics, and partner trends.
              </Text>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  styles.premiumButton,
                  creatingCheckout === "premium" &&
                    styles.upgradeButtonDisabled,
                ]}
                onPress={() => handleUpgrade("premium")}
                disabled={creatingCheckout === "premium"}
                activeOpacity={0.85}
              >
                {creatingCheckout === "premium" ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Ionicons
                      name="rocket-outline"
                      size={18}
                      color={colors.surface}
                    />
                    <Text style={styles.upgradeButtonText}>
                      Upgrade to Premium
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Card>
          </View>
        </Section>

        <Section
          title="Need help?"
          subtitle="We are one email away for billing questions or custom plans."
        >
          <Card style={styles.supportCard}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={colors.brand[500]}
            />
            <View style={styles.supportTextGroup}>
              <Text style={styles.supportTitle}>Talk to a human</Text>
              <Text style={styles.supportBody}>
                Email hello@heka.app and we will guide you through billing or
                upgrades.
              </Text>
            </View>
          </Card>
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.neutral[300],
  },
  errorCard: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  hero: {
    borderRadius: radii.xl,
    padding: spacing["2xl"],
    ...shadows.card,
    gap: spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  heroEyebrow: {
    ...typography.label,
    color: colors.surface,
    opacity: 0.8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...typography.heading,
    color: colors.surface,
    fontSize: 28,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  heroBadge: {
    borderRadius: radii.full,
    backgroundColor: "rgba(15,23,42,0.1)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  heroBadgeText: {
    ...typography.label,
    color: colors.surface,
    letterSpacing: 1.2,
  },
  heroDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  dateColumn: {
    flexShrink: 0,
  },
  dateLabel: {
    ...typography.label,
    color: colors.surface,
    opacity: 0.7,
    marginBottom: spacing.xs,
  },
  dateValue: {
    ...typography.body,
    color: colors.surface,
  },
  usageCard: {
    gap: spacing.md,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  usageHeadline: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  usagePercentage: {
    ...typography.heading,
    fontSize: 22,
    color: colors.brand[500],
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.neutral[700],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brand[500],
  },
  usagePeriod: {
    ...typography.body,
    color: colors.neutral[400],
  },
  benefitList: {
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  benefitText: {
    ...typography.body,
    color: colors.neutral[200],
  },
  upgradeGrid: {
    gap: spacing.lg,
  },
  upgradeCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  upgradeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  upgradeTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  upgradePrice: {
    ...typography.body,
    color: colors.brand[500],
    fontWeight: "700",
  },
  upgradeCopy: {
    ...typography.body,
    color: colors.neutral[400],
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.neutral[900],
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  premiumButton: {
    backgroundColor: colors.brand[600],
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    ...typography.label,
    color: colors.surface,
  },
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  supportTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  supportTitle: {
    ...typography.heading,
    fontSize: 18,
    color: colors.neutral[100],
  },
  supportBody: {
    ...typography.body,
    color: colors.neutral[400],
    lineHeight: 20,
  },
});
