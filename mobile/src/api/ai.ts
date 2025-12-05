import { api } from "./client";

export type AIInsight = {
  id: string;
  summary: string;
  common_ground: string[];
  disagreements: string[];
  root_causes: string[];
  suggestions: {
    title: string;
    description: string;
    actionable_steps: string[];
  }[];
  communication_tips: string[];
  generated_at: string;
  model_used: string;
  safety_check?: {
    blocked: boolean;
    reason?: string;
  };
};

export async function getAIInsights(
  argumentId: string,
): Promise<AIInsight | null> {
  try {
    const response = await api.get<AIInsight>(
      `/api/ai/arguments/${argumentId}/insights`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Insights not generated yet
    }
    throw error;
  }
}

export async function analyzeArgument(argumentId: string): Promise<AIInsight> {
  const response = await api.post<AIInsight>(
    `/api/ai/arguments/${argumentId}/analyze`,
  );
  return response.data;
}

export type GoalSuggestion = {
  title: string;
  description: string;
  category: string;
};

export type CheckInSuggestion = {
  question: string;
  category: string;
};

export async function generateArgumentGoals(
  argumentId: string,
): Promise<{ suggestions: GoalSuggestion[] }> {
  const response = await api.post<{ suggestions: GoalSuggestion[] }>(
    `/api/ai/arguments/${argumentId}/generate-goals`,
  );
  return response.data;
}

export async function generateArgumentCheckins(
  argumentId: string,
): Promise<{ suggestions: CheckInSuggestion[] }> {
  const response = await api.post<{ suggestions: CheckInSuggestion[] }>(
    `/api/ai/arguments/${argumentId}/generate-checkins`,
  );
  return response.data;
}
