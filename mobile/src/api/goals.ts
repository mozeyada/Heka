import { api } from './client';

export type GoalListItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  target_date: string | null;
  created_at: string;
};

export async function fetchGoals(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<GoalListItem[]> {
  const response = await api.get<GoalListItem[]>('/api/goals', {
    params,
  });
  return response.data;
}

export async function updateGoalStatus(goalId: string, status: string) {
  const response = await api.patch(`/api/goals/${goalId}/status`, { status });
  return response.data;
}

export async function addGoalProgress(goalId: string, notes?: string, progressValue?: number) {
  const response = await api.post(`/api/goals/${goalId}/progress`, {
    notes,
    progress_value: progressValue,
  });
  return response.data;
}
