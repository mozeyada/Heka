import { api } from './client';

export type ArgumentListItem = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
};

export type ArgumentDetail = ArgumentListItem & {
  couple_id: string;
};

export async function fetchArguments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
}): Promise<ArgumentListItem[]> {
  const response = await api.get<ArgumentListItem[]>('/api/arguments', {
    params,
  });
  return response.data;
}

export async function fetchArgument(argumentId: string): Promise<ArgumentDetail> {
  const response = await api.get<ArgumentDetail>(`/api/arguments/${argumentId}`);
  return response.data;
}
