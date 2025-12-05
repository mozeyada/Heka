import { api } from "./client";

export type AIGoalSuggestion = {
  title: string;
  description: string;
  category: string;
};

export type AICheckInSuggestion = {
  question: string;
  category: string;
};

export type AIGoalsResponse = {
  suggestions: AIGoalSuggestion[];
};

export type AICheckInsResponse = {
  suggestions: AICheckInSuggestion[];
};

export async function fetchGoalSuggestions(): Promise<AIGoalsResponse> {
  const response = await api.get<AIGoalsResponse>("/api/ai/goals/suggestions");
  return response.data;
}

export async function fetchCheckinSuggestions(): Promise<AICheckInsResponse> {
  const response = await api.get<AICheckInsResponse>(
    "/api/ai/checkins/suggestions",
  );
  return response.data;
}
