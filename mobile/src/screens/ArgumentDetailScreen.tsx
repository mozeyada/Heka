import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAIInsights, analyzeArgument, AIInsight } from "../api/ai";
import { fetchArgument, deleteArgument, updateArgumentStatus } from "../api/arguments";
import { CementWinModal } from "../components/arguments/CementWinModal";
import {
  submitPerspective,
  getPerspectivesForArgument,
  Perspective,
} from "../api/perspectives";
import { Card, Section, Skeleton } from "../components/common";
import { useAuthStore } from "../store/auth";
import { colors, spacing, radii, typography, shadows } from "../theme/tokens";

type Props = {
  argumentId?: string;
};

// --- Main Component --- //
export default function ArgumentDetailScreen({ argumentId }: Props) {
  const router = useRouter();
  const [argument, setArgument] = useState<any>(null);
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCementModal, setShowCementModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confettiRef = useRef<ConfettiCannon>(null);
  const { userId } = useAuthStore();
  const insets = useSafeAreaInsets();
  const contentContainerStyle = useMemo(
    () => [styles.container, { paddingTop: spacing.lg + insets.top }],
    [insets.top],
  );

  const loadData = useCallback(async () => {
    if (!argumentId) return;
    setLoading(true);
    setError(null);
    try {
      const [arg, pers, ins] = await Promise.all([
        fetchArgument(argumentId),
        getPerspectivesForArgument(argumentId),
        getAIInsights(argumentId).catch(() => null), // Gracefully fail if no insights exist
      ]);
      setArgument(arg);
      setPerspectives(pers);
      setAIInsights(ins);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to load data.",
      );
    } finally {
      setLoading(false);
    }
  }, [argumentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  const handleAnalyze = async () => {
    if (!argumentId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const insights = await analyzeArgument(argumentId);
      setAIInsights(insights);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to analyze argument";
      setError(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!argumentId) return;
    setUpdating(true);
    setError(null);
    try {
      const updatedArg = await updateArgumentStatus(argumentId, newStatus);
      setArgument((prev: any) => ({ ...prev, status: newStatus }));

      if (newStatus === 'resolved') {
        confettiRef.current?.start();
        setTimeout(() => setShowCementModal(true), 1500);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update status";
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!argumentId) return;

    Alert.alert(
      "Delete Argument",
      "Are you sure you want to delete this argument? This action cannot be undone and will also delete all associated perspectives and insights.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            setError(null);
            try {
              await deleteArgument(argumentId);
              router.back();
            } catch (error: any) {
              const errorMessage =
                error.response?.data?.detail ||
                error.message ||
                "Failed to delete argument";
              setError(errorMessage);
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) {
    return <LoadingSkeleton />;
  }

  if (error && !argument) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!argument) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Argument not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
        <ArgumentHeader
          argument={argument}
          onDelete={handleDelete}
          isDeleting={deleting}
          onResolve={() => handleStatusUpdate("resolved")}
          onReopen={() => handleStatusUpdate("active")}
          isUpdating={updating}
        />

        {error && <ErrorCard message={error} />}

        <PerspectivesSection
          argumentId={argumentId!}
          perspectives={perspectives}
          userId={userId}
          onUpdate={loadData}
        />

        <AIInsightsSection
          argumentId={argumentId!}
          perspectivesCount={perspectives.length}
          aiInsights={aiInsights}
          isAnalyzing={analyzing}
          onAnalyze={handleAnalyze}
        />
      </ScrollView>
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        ref={confettiRef}
        fadeOut={true}
      />
      <CementWinModal
        visible={showCementModal}
        onClose={() => setShowCementModal(false)}
        argumentId={argumentId!}
      />
    </View>
  );
}

// --- Sub-components --- //

const LoadingSkeleton = () => (
  <View style={styles.container}>
    <Card>
      <Skeleton height={30} width="80%" />
      <Skeleton height={20} width="50%" style={{ marginTop: spacing.md }} />
    </Card>
    <Card>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Perspectives</Text>
        <Text style={styles.sectionSubtitle}>
          Each partner shares their view.
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <Skeleton height={80} />
        <Skeleton height={40} width="60%" style={{ marginTop: spacing.md }} />
      </View>
    </Card>
    <Card>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Text style={styles.sectionSubtitle}>
          Personalized mediation insights.
        </Text>
      </View>
      <View style={styles.sectionContent}>
        <Skeleton height={100} />
      </View>
    </Card>
  </View>
);

const ArgumentHeader = ({
  argument,
  onDelete,
  isDeleting,
  onResolve,
  onReopen,
  isUpdating,
}: {
  argument: any;
  onDelete?: () => void;
  isDeleting?: boolean;
  onResolve?: () => void;
  onReopen?: () => void;
  isUpdating?: boolean;
}) => (
  <Card>
    <View style={styles.headerRow}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{argument.title}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>{argument.status}</Text>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.metaText}>{argument.priority}</Text>
          <Text style={styles.metaSeparator}>•</Text>
          <Text style={styles.metaText}>{argument.category}</Text>
        </View>
        <Text style={styles.dateText}>
          Created: {new Date(argument.created_at).toLocaleDateString()}
        </Text>
      </View>
      {onDelete && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled,
          ]}
          onPress={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          )}
        </TouchableOpacity>
      )}
    </View>

    {/* Actions Row */}
    <View style={styles.actionRow}>
      {argument.status !== "resolved" ? (
        <TouchableOpacity
          style={[styles.resolveButton, isUpdating && styles.buttonDisabled]}
          onPress={onResolve}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.reopenButton, isUpdating && styles.buttonDisabled]}
          onPress={onReopen}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color={colors.neutral[600]} />
          ) : (
            <>
              <Ionicons
                name="refresh"
                size={18}
                color={colors.neutral[600]}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.reopenButtonText}>Reopen Argument</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  </Card>
);

const ErrorCard = ({ message }: { message: string }) => (
  <Card style={styles.errorCard}>
    <Text style={styles.errorText}>{message}</Text>
  </Card>
);

const PerspectivesSection = ({
  argumentId,
  perspectives,
  userId,
  onUpdate,
}: any) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUserSubmitted = perspectives.some(
    (p: Perspective) => p.user_id === userId,
  );

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await submitPerspective(argumentId, content.trim());
      setContent("");
      setShowForm(false);
      onUpdate(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit perspective.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section
      title="Perspectives"
      subtitle="Each partner shares their view to give the AI full context."
    >
      {perspectives.length === 0 ? (
        <EmptyState message="No perspectives yet. Add yours to begin." />
      ) : (
        perspectives.map((p: Perspective, index: number) => (
          <PerspectiveCard key={p.id} perspective={p} index={index} />
        ))
      )}

      {error && <Text style={styles.inlineErrorText}>{error}</Text>}

      {!hasUserSubmitted && !showForm && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.buttonText}>Add Your Perspective</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what happened, how it made you feel, and what you need..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            value={content}
            onChangeText={setContent}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[
                styles.button,
                (isSubmitting || !content.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !content.trim()}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Saving..." : "Save Perspective"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {hasUserSubmitted && !showForm && (
        <View style={styles.submittedMessage}>
          <Text style={styles.submittedText}>
            ✓ You have submitted your perspective.
          </Text>
        </View>
      )}
    </Section>
  );
};

const PerspectiveCard = ({
  perspective,
  index,
}: {
  perspective: Perspective;
  index: number;
}) => (
  <View style={styles.perspectiveCard}>
    <View style={styles.perspectiveHeader}>
      <Text style={styles.perspectiveLabel}>Perspective {index + 1}</Text>
      <Text style={styles.perspectiveDate}>
        {new Date(perspective.created_at).toLocaleDateString()}
      </Text>
    </View>
    <Text style={styles.perspectiveContent}>{perspective.content}</Text>
  </View>
);

const AIInsightsSection = ({
  perspectivesCount,
  aiInsights,
  isAnalyzing,
  onAnalyze,
}: any) => {
  const canAnalyze = perspectivesCount >= 2;

  return (
    <Section
      title="AI Insights"
      subtitle="Get personalized mediation insights based on both perspectives."
    >
      {canAnalyze && !aiInsights && (
        <TouchableOpacity
          style={[styles.button, isAnalyzing && styles.buttonDisabled]}
          onPress={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.buttonText}>Generate Insights</Text>
          )}
        </TouchableOpacity>
      )}

      {!aiInsights ? (
        <EmptyState
          message={
            canAnalyze
              ? 'Click "Generate Insights" to get personalized mediation guidance.'
              : "Add at least two perspectives to unlock AI insights."
          }
        />
      ) : aiInsights.safety_check?.blocked ? (
        <SafetyCard reason={aiInsights.safety_check.reason} />
      ) : (
        <View style={styles.insightsContainer}>
          <InsightCard title="Summary" content={aiInsights.summary} />
          <InsightCard
            title="Common Ground"
            items={aiInsights.common_ground}
            type="success"
          />
          <InsightCard title="Root Causes" items={aiInsights.root_causes} />
          <InsightCard
            title="Key Disagreements"
            items={aiInsights.disagreements}
            type="warning"
          />
          <InsightCard
            title="Communication Tips"
            items={aiInsights.communication_tips}
          />
          {aiInsights.suggestions?.map(
            (suggestion: AIInsight["suggestions"][0], idx: number) => (
              <SuggestionCard key={idx} suggestion={suggestion} />
            ),
          )}
        </View>
      )}
    </Section>
  );
};

interface InsightCardProps {
  title: string;
  content?: string;
  items?: string[];
  type?: "success" | "warning" | "danger";
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  content,
  items,
  type,
}) => {
  const cardStyles = [
    styles.insightCard,
    type === "success" && styles.successCard,
    type === "warning" && styles.warningCard,
    type === "danger" && styles.dangerCard,
  ];
  const titleStyles = [
    styles.insightTitle,
    type === "success" && styles.successTitle,
    type === "warning" && styles.warningTitle,
    type === "danger" && styles.dangerTitle,
  ];

  return (
    <View style={cardStyles}>
      <Text style={titleStyles}>{title}</Text>
      {content && <Text style={styles.insightContent}>{content}</Text>}
      {items &&
        items.map((item: string, idx: number) => (
          <Text key={idx} style={styles.insightBullet}>
            • {item}
          </Text>
        ))}
    </View>
  );
};

const SuggestionCard = ({ suggestion }: any) => (
  <View style={styles.insightCard}>
    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
    <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
    {suggestion.actionable_steps?.map((step: string, idx: number) => (
      <Text key={idx} style={styles.stepText}>
        {idx + 1}. {step}
      </Text>
    ))}
  </View>
);

const SafetyCard = ({ reason }: { reason?: string }) => (
  <View style={[styles.insightCard, styles.dangerCard]}>
    <Text style={[styles.insightTitle, styles.dangerTitle]}>
      Safety Concern Detected
    </Text>
    <Text style={styles.insightContent}>
      {reason ||
        "This situation may require professional help. Please consider reaching out to a licensed therapist or counselor."}
    </Text>
  </View>
);

const EmptyState = ({ message }: { message: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// --- Styles --- //
const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surfaceMuted,
  },
  container: {
    padding: spacing.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    ...typography.heading,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.label,
    color: colors.neutral[400],
    textTransform: "capitalize",
  },
  metaSeparator: {
    marginHorizontal: spacing.sm,
    color: colors.neutral[500],
  },
  dateText: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[400],
  },
  button: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.label,
    color: colors.surface,
  },
  buttonDisabled: {
    backgroundColor: colors.brand[400],
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[500],
    alignItems: "center",
    marginTop: spacing.md,
  },
  cancelButtonText: {
    ...typography.label,
    color: colors.neutral[200],
  },
  formContainer: {
    marginTop: spacing.lg,
  },
  textArea: {
    ...typography.body,
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    padding: spacing.md,
    color: colors.neutral[100],
    textAlignVertical: "top",
  },
  formActions: {
    marginTop: spacing.sm,
  },
  perspectiveCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  perspectiveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  perspectiveLabel: {
    ...typography.label,
    fontSize: 12,
    color: colors.neutral[400],
  },
  perspectiveDate: {
    ...typography.body,
    fontSize: 12,
    color: colors.neutral[400],
  },
  perspectiveContent: {
    ...typography.body,
    color: colors.neutral[200],
  },
  submittedMessage: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand[900],
  },
  submittedText: {
    ...typography.label,
    color: colors.brand[200],
    textAlign: "center",
  },
  emptyState: {
    padding: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[400],
    textAlign: "center",
  },
  insightsContainer: {
    gap: spacing.md,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  insightTitle: {
    ...typography.label,
    fontSize: 16,
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  insightContent: {
    ...typography.body,
    color: colors.neutral[300],
  },
  insightBullet: {
    ...typography.body,
    color: colors.neutral[300],
    marginBottom: spacing.xs,
  },
  suggestionTitle: {
    ...typography.label,
    fontSize: 15,
    color: colors.brand[500],
  },
  suggestionDescription: {
    ...typography.body,
    color: colors.neutral[300],
    marginVertical: spacing.sm,
  },
  stepText: {
    ...typography.body,
    fontSize: 14,
    color: colors.neutral[200],
    marginBottom: spacing.xs,
  },
  successCard: {
    borderColor: colors.success,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  successTitle: {
    color: colors.success,
  },
  warningCard: {
    borderColor: colors.warning,
    backgroundColor: "rgba(249, 115, 22, 0.05)",
  },
  warningTitle: {
    color: colors.warning,
  },
  dangerCard: {
    borderColor: colors.danger,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  dangerTitle: {
    color: colors.danger,
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: colors.danger,
    borderWidth: 1,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  inlineErrorText: {
    ...typography.body,
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: "center",
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[600],
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.neutral[100],
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
  sectionContent: {
    marginTop: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  actionRow: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.md,
  },
  resolveButton: {
    backgroundColor: colors.success,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resolveButtonText: {
    ...typography.label,
    color: "#fff",
  },
  reopenButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  reopenButtonText: {
    ...typography.label,
    color: colors.neutral[600],
  },
});
