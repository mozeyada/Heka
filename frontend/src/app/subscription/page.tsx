'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Crown,
  LockKeyhole,
  Link2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { subscriptionsAPI } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
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
  const [requiresCoupleSetup, setRequiresCoupleSetup] = useState(false);
  const [billingUnavailable, setBillingUnavailable] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRequiresCoupleSetup(false);
      const [subData, usageData] = await Promise.all([
        subscriptionsAPI.getMySubscription(),
        subscriptionsAPI.getUsage(),
      ]);
      setSubscription(subData);
      setUsage(usageData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setRequiresCoupleSetup(true);
        setSubscription(null);
        setUsage(null);
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, loadData, router]);

  const handleUpgrade = async (tier: 'basic' | 'premium') => {
    try {
      setCreatingCheckout(tier);
      setError(null);
      setBillingUnavailable(false);

      const successUrl = `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/subscription`;

      const { checkout_url } = await subscriptionsAPI.createCheckoutSession({
        tier,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      window.location.href = checkout_url;
    } catch (err: any) {
      if (err.response?.status === 503) {
        setBillingUnavailable(true);
      }
      setError(err.response?.data?.detail || 'Failed to create checkout session');
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
  const isPaidTier = subscription?.tier === 'basic' || subscription?.tier === 'premium';
  const isFreeTrial = subscription?.status === 'trial' && subscription?.tier === 'free';
  const isPaidTrial = subscription?.status === 'trial' && isPaidTier;
  const isActivePaid = subscription?.status === 'active' && isPaidTier;
  const isInactivePaid = (subscription?.status === 'cancelled' || subscription?.status === 'expired') && isPaidTier;
  const planTitle = subscription
    ? isFreeTrial
      ? 'Free trial'
      : isPaidTrial
        ? `${getTierDisplayName(subscription.tier)} trial`
        : `${getTierDisplayName(subscription.tier)} plan`
    : '';

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
          helper: 'Your plan is live and fully available.',
        };
      case 'trial':
        return {
          label: 'Trial',
          className: 'border-teal-500/20 bg-teal-500/10 text-teal-300',
          helper: 'You are currently in the full-access trial window.',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'border-red-500/20 bg-red-500/10 text-red-300',
          helper: 'This plan will stop renewing unless reactivated.',
        };
      default:
        return {
          label: status,
          className: 'border-white/10 bg-white/[0.05] text-zinc-300',
          helper: 'Plan state information is available below.',
        };
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  const statusMeta = subscription ? getStatusMeta(subscription.status) : null;
  const usageRatio =
    usage && !usage.is_unlimited && usage.limit > 0
      ? Math.min(100, (usage.usage_count / usage.limit) * 100)
      : 0;

  return (
    <div className="min-h-screen pb-28 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-teal-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[18%] h-[46vh] w-[46vh] rounded-full bg-indigo-900/16 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[28%] h-[34vh] w-[34vh] rounded-full bg-cyan-900/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <PageHeading
        title="Subscription & Usage"
        description="Manage your plan, monitor consumption, and upgrade only when the relationship workflow is proving valuable."
        actions={
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container space-y-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {requiresCoupleSetup && (
          <div className="section-shell border border-indigo-500/20 bg-indigo-500/[0.06] p-7 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                  <Link2 className="h-3.5 w-3.5" />
                  Couple setup required
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">Link your partner before billing</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300/85">
                  Subscription is tied to the shared couple workspace. Finish partner linking first, then this page becomes the billing and usage center for both of you.
                </p>
              </div>
              <Link href="/couples/create" className="btn-primary inline-flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Link Partner
              </Link>
            </div>
          </div>
        )}

        {subscription && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="section-shell p-7 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                    <Crown className="h-3.5 w-3.5" />
                    Current subscription
                  </div>
                  <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">
                    {planTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {isPaidTrial
                      ? `You are evaluating ${getTierDisplayName(subscription.tier)} during the current trial window.`
                      : statusMeta?.helper}
                  </p>
                </div>

                <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${statusMeta?.className}`}>
                  {statusMeta?.label}
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Current period</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'No renewal scheduled'}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {subscription.current_period_start ? `Started ${formatDate(subscription.current_period_start)}` : 'Start date unavailable'}
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Access state</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {isFreeTrial
                      ? 'Trial access enabled'
                      : isPaidTrial
                        ? 'Paid plan under trial evaluation'
                        : 'Premium features available'}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {subscription.trial_end
                      ? `Trial ends ${formatDate(subscription.trial_end)}`
                      : 'Billing status managed here'}
                  </p>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="mt-6 rounded-[1.6rem] border border-amber-500/20 bg-amber-500/10 p-5">
                  <p className="text-sm font-semibold text-amber-100">Cancellation scheduled at period end</p>
                  <p className="mt-2 text-sm text-amber-200/80">
                    Restore your plan before the cycle closes to avoid losing access continuity.
                  </p>
                </div>
              )}
            </div>

            {usage && (
              <div className="section-shell p-7 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Usage this period</p>
                    <h2 className="mt-2 text-2xl font-medium tracking-tight text-white">
                      {usage.is_unlimited ? 'Unlimited access' : `${usage.usage_count} of ${usage.limit} used`}
                    </h2>
                    <p className="mt-3 text-sm text-zinc-400">
                      Period: {formatDate(usage.period_start)} to {formatDate(usage.period_end)}
                    </p>
                  </div>
                </div>

                {usage.is_unlimited ? (
                  <div className="mt-8 rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <div className="flex items-center gap-3">
                      <BadgeCheck className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-emerald-100">
                        Unlimited argument resolutions and check-ins are unlocked on this plan.
                      </p>
                    </div>
                  </div>
                ) : usage.limit === 0 ? (
                  <div className="mt-8 rounded-[1.6rem] border border-red-500/20 bg-red-500/10 p-5">
                    <p className="text-sm font-semibold text-red-100">No active usage allowance on this subscription state</p>
                    <p className="mt-2 text-sm text-red-200/80">
                      This usually means the plan is expired or cancelled. Reactivate below to restore access.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-zinc-300">
                      <span>Argument resolutions</span>
                      <span>{usage.usage_count} / {usage.limit}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${usage.usage_count >= usage.limit ? 'bg-red-500' : 'bg-gradient-to-r from-teal-400 to-indigo-400'}`}
                        style={{ width: `${usageRatio}%` }}
                      />
                    </div>
                    <p className={`text-sm ${usage.usage_count >= usage.limit ? 'text-red-300' : 'text-zinc-500'}`}>
                      {usage.usage_count >= usage.limit
                        ? 'Limit reached. Upgrade to continue logging new conflicts and insights.'
                        : 'You still have room this period before an upgrade becomes necessary.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {subscription && (subscription.tier === 'free' || isInactivePaid) && (
          <div className="section-shell p-7 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Upgrade options
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">Choose the depth you need</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  The premium tiers should feel like a natural extension of the mediation flow, not a separate billing product bolted on afterward.
                </p>
              </div>
            </div>

            {billingUnavailable && (
              <div className="mt-6 rounded-[1.6rem] border border-amber-500/20 bg-amber-500/10 p-5">
                <p className="text-sm font-semibold text-amber-100">Billing is not configured in this environment yet</p>
                <p className="mt-2 text-sm text-amber-200/80">
                  The upgrade flow is wired, but Stripe checkout is unavailable on the current deployment. This should fail gracefully instead of trapping the user.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Free trial</p>
                <p className="mt-2 text-sm font-semibold text-white">7 days / 5 arguments</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Basic</p>
                <p className="mt-2 text-sm font-semibold text-white">Unlimited core usage</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Premium</p>
                <p className="mt-2 text-sm font-semibold text-white">Full insight depth</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.9rem] border border-white/10 bg-black/25 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Basic</p>
                <div className="mt-4 text-4xl font-medium text-white">$9.99</div>
                <p className="mt-1 text-sm text-zinc-500">per month</p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                  <li>Unlimited argument resolutions</li>
                  <li>Weekly relationship check-ins</li>
                  <li>Monthly AI insight summaries</li>
                  <li>Communication exercises</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('basic')}
                  disabled={creatingCheckout === 'basic'}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCheckout === 'basic' ? 'Processing…' : 'Upgrade to Basic'}
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[1.9rem] border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 p-6">
                <span className="absolute right-5 top-5 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200">
                  Most popular
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Premium</p>
                <div className="mt-4 text-4xl font-medium text-white">$19.99</div>
                <p className="mt-1 text-sm text-zinc-400">per month</p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-200">
                  <li>Everything in Basic</li>
                  <li>Advanced AI insights and proactive prompts</li>
                  <li>Unlimited communication exercises</li>
                  <li>Relationship goal tracking and analytics</li>
                  <li>Priority support</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={creatingCheckout === 'premium'}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-indigo-400 px-4 py-3 text-sm font-semibold text-black shadow-[0_0_26px_rgba(45,212,191,0.18)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCheckout === 'premium' ? 'Processing…' : 'Upgrade to Premium'}
                </button>
              </div>
            </div>

            <p className="mt-5 text-xs text-zinc-500">
              Upgrades are processed in Stripe Checkout. In-app cancellation and billing history are not exposed on this screen yet, so support should remain the fallback for billing changes.
            </p>
          </div>
        )}

        {subscription && subscription.tier !== 'free' && (isPaidTrial || isActivePaid || isInactivePaid) && (
          <div
            className={`section-shell p-7 ${
              isPaidTrial
                ? 'border border-teal-500/20 bg-teal-500/[0.06]'
                : isActivePaid
                  ? 'border border-emerald-500/20 bg-emerald-500/[0.06]'
                  : 'border border-amber-500/20 bg-amber-500/[0.06]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isPaidTrial
                    ? 'border border-teal-500/20 bg-teal-500/10 text-teal-300'
                    : isActivePaid
                      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      : 'border border-amber-500/20 bg-amber-500/10 text-amber-300'
                }`}
              >
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {isPaidTrial
                    ? `${getTierDisplayName(subscription.tier)} is currently being evaluated`
                    : isActivePaid
                      ? `You are already on ${getTierDisplayName(subscription.tier)}`
                      : `${getTierDisplayName(subscription.tier)} is not currently active`}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300/85">
                  {isPaidTrial
                    ? 'Your paid tier has been selected and the relationship workflow should remain open during the trial window. This page should now feel informative, not contradictory.'
                    : isActivePaid
                      ? 'Billing is active and the relationship workflow is fully unlocked. No extra action needed from this page right now.'
                      : 'This plan exists on the record, but access is not active. Use the plan cards above if you need to restore billing.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
