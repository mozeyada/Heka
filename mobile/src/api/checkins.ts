import { api } from './client';

export type CheckinHistoryItem = {
  id: string;
  week_start_date: string;
  status: string;
  completed_at: string | null;
};

export type CheckinHistoryResponse = {
  checkins: CheckinHistoryItem[];
  next_offset: number | null;
};

export async function fetchCheckinHistory(params?: {
  limit?: number;
  offset?: number;
}): Promise<CheckinHistoryResponse> {
  const response = await api.get<CheckinHistoryResponse>('/api/checkins/history', {
    params,
  });
  return response.data;
}

export async function fetchCurrentCheckin() {
  const response = await api.get('/api/checkins/current');
  return response.data;
}

export async function completeCurrentCheckin(responses: Record<string, string>) {
  const response = await api.post('/api/checkins/current/complete', {
    responses,
  });
  return response.data;
}
