
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
} from "react-native";

import {
    generateArgumentGoals,
    generateArgumentCheckins,
    GoalSuggestion,
    CheckInSuggestion,
} from "../../api/ai";
import { createGoal } from "../../api/goals";
import { colors, radii, spacing, typography, shadows } from "../../theme/tokens";

type Props = {
    visible: boolean;
    onClose: () => void;
    argumentId: string;
};

export function CementWinModal({ visible, onClose, argumentId }: Props) {
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<GoalSuggestion[]>([]);
    const [checkins, setCheckins] = useState<CheckInSuggestion[]>([]);
    const [savingGoalIndex, setSavingGoalIndex] = useState<number | null>(null);

    useEffect(() => {
        if (visible && argumentId) {
            loadSuggestions();
        }
    }, [visible, argumentId]);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            // Parallel fetch for speed
            const [goalsParams, checkinsParams] = await Promise.all([
                generateArgumentGoals(argumentId),
                generateArgumentCheckins(argumentId),
            ]);
            setGoals(goalsParams.suggestions);
            setCheckins(checkinsParams.suggestions);
        } catch (error) {
            console.error("Failed to load suggestions:", error);
            // Don't alert blocking error, just show empty state or partials
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGoal = async (goal: GoalSuggestion, index: number) => {
        setSavingGoalIndex(index);
        try {
            // Default to 1 month from now for target date
            const targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() + 1);

            await createGoal({
                title: goal.title,
                description: goal.description,
                target_date: targetDate.toISOString(),
            });
            Alert.alert("Success", "Goal saved to your shared list!");
        } catch (error) {
            Alert.alert("Error", "Failed to save goal.");
        } finally {
            setSavingGoalIndex(null);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>🌱 Cement the Win</Text>
                            <Text style={styles.subtitle}>
                                Turn this resolution into lasting growth.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.neutral[500]} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.brand[500]} />
                            <Text style={styles.loadingText}>Generating personalized steps...</Text>
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.content}>
                            {/* Goals Section */}
                            {goals.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Suggested Shared Goals</Text>
                                    {goals.map((goal, index) => (
                                        <View key={index} style={styles.card}>
                                            <View style={styles.cardContent}>
                                                <Text style={styles.cardTitle}>{goal.title}</Text>
                                                <Text style={styles.cardDescription}>
                                                    {goal.description}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleSaveGoal(goal, index)}
                                                disabled={savingGoalIndex === index}
                                            >
                                                {savingGoalIndex === index ? (
                                                    <ActivityIndicator size="small" color={colors.surface} />
                                                ) : (
                                                    <Text style={styles.actionButtonText}>Save Goal</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Check-ins Section (Display Only for now, maybe actionable later) */}
                            {checkins.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Weekly Check-in Question</Text>
                                    <View style={styles.infoCard}>
                                        <Ionicons
                                            name="chatbubbles-outline"
                                            size={20}
                                            color={colors.brand[600]}
                                            style={styles.infoIcon}
                                        />
                                        <Text style={styles.infoText}>
                                            Ask this next week: "{checkins[0].question}"
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radii.xl,
        borderTopRightRadius: radii.xl,
        height: "85%",
        ...shadows.card,
    },
    header: {
        padding: spacing.lg,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[600],
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        ...typography.heading,
        fontSize: 24,
        color: colors.neutral[25], // Darkest
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.neutral[300],
    },
    closeButton: {
        padding: spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: spacing.md,
        ...typography.label,
        color: colors.neutral[300],
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing["2xl"],
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.label,
        color: colors.neutral[300],
        marginBottom: spacing.md,
        textTransform: "uppercase",
    },
    card: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        flexDirection: "column",
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.neutral[600],
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...typography.label,
        fontSize: 18,
        color: colors.neutral[25],
        marginBottom: spacing.xs,
    },
    cardDescription: {
        ...typography.body,
        fontSize: 14,
        color: colors.neutral[200],
    },
    actionButton: {
        backgroundColor: colors.brand[600],
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
        alignItems: "center",
        alignSelf: "flex-start",
    },
    actionButtonText: {
        ...typography.label,
        color: colors.surface,
    },
    infoCard: {
        backgroundColor: colors.brand[50],
        padding: spacing.md,
        borderRadius: radii.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    infoIcon: {
        opacity: 0.8,
    },
    infoText: {
        ...typography.body,
        color: colors.brand[900],
        fontStyle: "italic",
        flex: 1,
    },
    doneButton: {
        backgroundColor: colors.neutral[700],
        padding: spacing.md,
        borderRadius: 100, // Manual circle
        alignItems: "center",
        marginTop: spacing.md,
    },
    doneButtonText: {
        ...typography.label,
        color: colors.neutral[25],
    },
});
