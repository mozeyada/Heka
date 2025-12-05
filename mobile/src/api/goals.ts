import { api } from "./client";
import { Goal, GoalDetail } from "../models/goal";

// Re-export for convenience
export type { Goal, GoalDetail } from "../models/goal";
export type GoalListItem = Goal;

export async function fetchGoals(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<GoalListItem[]> {
  // CRITICAL: Use trailing slash to avoid 307 redirect that loses Authorization header
  const response = await api.get<GoalListItem[]>("/api/goals/", {
    params,
  });
  return response.data;
}

export async function fetchGoal(goalId: string): Promise<GoalDetail> {
  const response = await api.get<GoalDetail>(`/api/goals/${goalId}`);
  return response.data;
}

export async function createGoal(data: {
  title: string;
  description: string;
  target_date: string;
}): Promise<Goal> {
  const response = await api.post<Goal>("/api/goals/", data);
  return response.data;
}

export async function updateGoalStatus(goalId: string, status: string) {
  const response = await api.patch(`/api/goals/${goalId}/status`, { status });
  return response.data;
}

export async function addGoalProgress(
  goalId: string,
  notes?: string,
  progressValue?: number,
) {
  const response = await api.post(`/api/goals/${goalId}/progress`, {
    notes,
    progress_value: progressValue,
  });
  return response.data;
}
