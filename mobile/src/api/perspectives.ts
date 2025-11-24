import { api } from './client';

export type Perspective = {
  id: string;
  argument_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export async function submitPerspective(argumentId: string, content: string) {
  const response = await api.post('/api/perspectives/create', {
    argument_id: argumentId,
    content,
  });
  return response.data;
}

export async function getPerspectivesForArgument(argumentId: string): Promise<Perspective[]> {
  const response = await api.get<Perspective[]>(`/api/perspectives/argument/${argumentId}`);
  return response.data;
}
