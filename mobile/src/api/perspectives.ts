import { api } from './client';

export async function submitPerspective(argumentId: string, content: string) {
  const response = await api.post('/api/perspectives/create', {
    argument_id: argumentId,
    content,
  });
  return response.data;
}
