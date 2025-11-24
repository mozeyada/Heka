import { api } from './client';
import { Argument } from '../models/argument';

// Re-export for convenience
export type { Argument } from '../models/argument';
export type ArgumentListItem = Argument;

export type ArgumentDetail = ArgumentListItem & {
  couple_id: string;
};

export async function fetchArguments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
}): Promise<ArgumentListItem[]> {
  // CRITICAL: Use trailing slash to avoid 307 redirect that loses Authorization header
  const response = await api.get<ArgumentListItem[]>('/api/arguments/', {
    params,
  });
  return response.data;
}

export async function fetchArgument(argumentId: string): Promise<ArgumentDetail> {
  const response = await api.get<ArgumentDetail>(`/api/arguments/${argumentId}`);
  return response.data;
}

export async function createArgument(data: {
  title: string;
  category: string;
  priority: string;
}): Promise<ArgumentDetail> {
  const response = await api.post<ArgumentDetail>('/api/arguments/', data);
  return response.data;
}
