import { api } from './client';

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface Subscription {
  id: string;
  couple_id: string;
  tier: SubscriptionTier;
  status: string;
  trial_start?: string | null;
  trial_end?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancelled_at?: string | null;
  cancel_at_period_end: boolean;
}

export interface Usage {
  usage_count: number;
  limit: number;
  is_unlimited: boolean;
  period_start: string;
  period_end: string;
}

export async function fetchSubscription(): Promise<Subscription> {
  const response = await api.get<Subscription>('/api/subscriptions/me');
  return response.data;
}

export async function fetchUsage(): Promise<Usage> {
  const response = await api.get<Usage>('/api/subscriptions/usage');
  return response.data;
}

export async function createCheckoutSession(tier: 'basic' | 'premium', returnUrl: string) {
  const response = await api.post<{ checkout_url: string }>('/api/subscriptions/create-checkout-session', {
    tier,
    success_url: returnUrl,
    cancel_url: returnUrl,
  });
  return response.data;
}
