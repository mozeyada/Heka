'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { subscriptionsAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  trial_start?: string;
  trial_end?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  cancel_at_period_end: boolean;
}

interface Usage {
  usage_count: number;
  limit: number;
  is_unlimited: boolean;
  period_start: string;
  period_end: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingCheckout, setCreatingCheckout] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subData, usageData] = await Promise.all([
        subscriptionsAPI.getMySubscription(),
        subscriptionsAPI.getUsage(),
      ]);
      setSubscription(subData);
      setUsage(usageData);
    } catch (error: any) {
      console.error('Failed to load subscription data:', error);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: 'basic' | 'premium') => {
    try {
      setCreatingCheckout(tier);
      setError(null);

      const successUrl = `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/subscription`;

      const { checkout_url } = await subscriptionsAPI.createCheckoutSession({
        tier,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      window.location.href = checkout_url;
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create checkout session');
      setCreatingCheckout(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierDisplayName = (tier: string) => tier.charAt(0).toUpperCase() + tier.slice(1);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', className: 'bg-success-100 text-success-600' };
      case 'trial':
        return { label: 'Trial', className: 'bg-brand-50 text-brand-600' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-danger-100 text-danger-600' };
      default:
        return { label: status, className: 'bg-neutral-100 text-neutral-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Subscription & Usage"
        description="Manage your plan, monitor usage, and upgrade when you're ready for more insights."
        actions={
          <Link
            href="/dashboard"
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
          >
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container space-y-8">
        {error && (
          <div className="section-shell border border-danger-100 bg-danger-50/80 p-5">
            <p className="text-sm font-semibold text-danger-600">{error}</p>
          </div>
        )}

        {subscription && (
          <div className="section-shell p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Current Subscription</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {subscription.status === 'trial'
                    ? 'Enjoy full access during your trial period.'
                    : 'Your subscription is active and up to date.'}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(subscription.status).className}`}
              >
                {getStatusBadge(subscription.status).label}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/40 bg-white/70 p-5">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Tier</p>
                <p className="mt-2 text-lg font-semibold text-neutral-900">{getTierDisplayName(subscription.tier)}</p>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/70 p-5">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Next Renewal</p>
                <p className="mt-2 text-lg font-semibold text-neutral-900">
                  {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'N/A'}
                </p>
              </div>
            </div>

            {subscription.status === 'trial' && subscription.trial_end && (
              <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/80 p-5">
                <p className="text-sm font-semibold text-brand-600">
                  Trial ends {formatDate(subscription.trial_end)}
                </p>
                <p className="mt-2 text-sm text-brand-500">
                  Upgrade now to keep unlimited access after your trial.
                </p>
              </div>
            )}

            {subscription.cancel_at_period_end && (
              <div className="mt-6 rounded-2xl border border-warning-200 bg-warning-50/80 p-5">
                <p className="text-sm font-semibold text-warning-600">
                  Cancels at end of billing period
                </p>
                <p className="mt-2 text-sm text-warning-500">
                  Restore your subscription before the billing cycle ends to maintain access.
                </p>
              </div>
            )}
          </div>
        )}

        {usage && (
          <div className="section-shell p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Usage This Period</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Period: {formatDate(usage.period_start)} – {formatDate(usage.period_end)}
            </p>

            <div className="mt-6">
              {usage.is_unlimited ? (
                <div className="rounded-2xl border border-success-200 bg-success-50/80 p-5 text-sm font-semibold text-success-600">
                  Unlimited argument resolutions • Enjoy full access with your current plan.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-neutral-600">
                    <span>Argument Resolutions</span>
                    <span>{usage.usage_count} / {usage.limit}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={`h-full rounded-full ${usage.usage_count >= usage.limit ? 'bg-danger-500' : 'bg-brand-500'}`}
                      style={{ width: `${Math.min(100, (usage.usage_count / usage.limit) * 100)}%` }}
                    />
                  </div>
                  {usage.usage_count >= usage.limit && (
                    <p className="text-sm text-danger-600">
                      Limit reached. Upgrade to continue logging new arguments.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {subscription && subscription.tier === 'free' && (
          <div className="section-shell p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Upgrade Your Plan</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Choose the plan that best supports your relationship journey.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/40 bg-white/70 p-6">
                <h3 className="text-lg font-semibold text-neutral-900">Basic</h3>
                <p className="mt-2 text-sm text-neutral-500">Perfect for couples who want unlimited resolutions.</p>
                <div className="mt-6 text-3xl font-semibold text-neutral-900">$9.99</div>
                <p className="text-sm text-neutral-400">per month</p>
                <ul className="mt-6 space-y-2 text-sm text-neutral-500">
                  <li>• Unlimited argument resolutions</li>
                  <li>• Weekly relationship check-ins</li>
                  <li>• Monthly AI insight summaries</li>
                  <li>• Communication exercises</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('basic')}
                  disabled={creatingCheckout === 'basic'}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  {creatingCheckout === 'basic' ? 'Processing…' : 'Upgrade to Basic'}
                </button>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-brand-50/60 p-6">
                <span className="absolute right-5 top-5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-600 shadow-soft">
                  Most Popular
                </span>
                <h3 className="text-lg font-semibold text-neutral-900">Premium</h3>
                <p className="mt-2 text-sm text-neutral-500">Unlock every insight, exercise, and proactive prompt.</p>
                <div className="mt-6 text-3xl font-semibold text-neutral-900">$19.99</div>
                <p className="text-sm text-neutral-400">per month</p>
                <ul className="mt-6 space-y-2 text-sm text-neutral-500">
                  <li>• Everything in Basic</li>
                  <li>• Advanced AI insights & proactive prompts</li>
                  <li>• Unlimited communication exercises</li>
                  <li>• Relationship goal tracking & analytics</li>
                  <li>• Priority support</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={creatingCheckout === 'premium'}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCheckout === 'premium' ? 'Processing…' : 'Upgrade to Premium'}
                </button>
              </div>
            </div>
          </div>
        )}

        {subscription && subscription.tier !== 'free' && (
          <div className="section-shell border border-success-200 bg-success-50/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-success-600">Thank you for being a member</h3>
            <p className="mt-3 text-sm text-success-600">
              You have full access to Heka {getTierDisplayName(subscription.tier)}. We're honored to support your relationship journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

