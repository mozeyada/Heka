import { api } from './client';

export type Checkin = {
  id: string;
  week_start_date: string;
  status: string;
  completed_at: string | null;
  responses: Record<string, string> | null;
};

export type CheckinHistoryItem = Omit<Checkin, 'responses'>;

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

export async function getCurrentCheckin(): Promise<Checkin> {
  const response = await api.get<Checkin>('/api/checkins/current');
  return response.data;
}

export async function completeCheckin(responses: Record<string, string>): Promise<Checkin> {
  const response = await api.post<Checkin>('/api/checkins/current/complete', {
    responses,
  });
  return response.data;
}