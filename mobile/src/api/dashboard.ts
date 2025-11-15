import { api } from './client';

export type DashboardOverview = {
  subscription: {
    tier: string;
    status: string;
    trial_end: string | null;
    period_start: string | null;
    period_end: string | null;
  };
  usage: {
    count: number;
    limit: number;
    is_unlimited: boolean;
    period_start: string | null;
    period_end: string | null;
  };
  arguments: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    category: string;
    created_at: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
    status: string;
    target_date: string | null;
  }>;
  current_checkin: {
    id?: string;
    status: string;
    completed_at: string | null;
  } | null;
  week_start_date: string;
};

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const response = await api.get<DashboardOverview>('/api/dashboard/overview');
  return response.data;
}
