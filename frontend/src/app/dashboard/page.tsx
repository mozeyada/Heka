'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCouplesStore } from '@/store/couplesStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { checkinsAPI } from '@/lib/api';
import { goalsAPI } from '@/lib/api';
import { subscriptionsAPI } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { PageHeading } from '@/components/PageHeading';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const { couple, fetchMyCouple } = useCouplesStore();
  const { arguments: args, fetchArguments } = useArgumentsStore();
  const [currentCheckin, setCurrentCheckin] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAuthenticated || !user) {
      fetchCurrentUser();
    }

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, router, fetchCurrentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await fetchMyCouple();
      await fetchArguments();

      if (couple) {
        try {
          const checkin = await checkinsAPI.getCurrent();
          setCurrentCheckin(checkin);
        } catch (error) {
          console.error('Failed to fetch check-in:', error);
        }

        try {
          const goalsData = await goalsAPI.getAll();
          const activeGoals = goalsData.filter((g: any) => g.status === 'active');
          setGoals(activeGoals);
        } catch (error) {
          console.error('Failed to fetch goals:', error);
        }

        try {
          const subData = await subscriptionsAPI.getMySubscription();
          setSubscription(subData);
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
        }

        try {
          const usageData = await subscriptionsAPI.getUsage();
          setUsage(usageData);
        } catch (error) {
          console.error('Failed to fetch usage:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <LoadingPage />;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title={`Welcome back, ${user.name}!`}
        description="Track your relationship health, complete check-ins, and keep arguments moving toward resolution."
        actions={
          subscription ? (
            <Link
              href="/subscription"
              className="rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5"
            >
              Manage Subscription
            </Link>
          ) : null
        }
      />

      <div className="app-container space-y-10">
        {error && (
          <ErrorAlert message={error} onRetry={loadDashboardData} onDismiss={() => setError(null)} />
        )}

        {/* Subscription Status */}
        {subscription && subscription.tier === 'free' && (
          <div className="section-shell p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Free Trial Active</h3>
                {subscription.status === 'trial' && subscription.trial_end && (
                  <p className="mt-2 text-sm text-neutral-600">
                    {usage && !usage.is_unlimited && (
                      <>
                        {usage.usage_count} / {usage.limit} arguments used
                        {usage.usage_count >= usage.limit && ' • Limit reached'}
                      </>
                    )}
                    <span className="ml-2 text-neutral-500">
                      Trial ends {new Date(subscription.trial_end).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
              <Link
                href="/subscription"
                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {usage && !usage.is_unlimited && usage.usage_count >= usage.limit && (
          <div className="section-shell border border-danger-100 bg-danger-50/80 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-danger-600">Usage Limit Reached</h3>
                <p className="mt-2 text-sm text-danger-600">
                  You've used all {usage.limit} argument resolutions in your plan. Upgrade to continue using Heka.
                </p>
              </div>
              <Link
                href="/subscription"
                className="rounded-full bg-danger-500 px-5 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
              >
                Upgrade
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="section-shell p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Weekly Check-in</h3>
            <p className="mt-2 text-sm text-neutral-500">
              {currentCheckin?.status === 'completed' ? 'Completed this week ✓' : 'Stay aligned with a quick weekly pulse.'}
            </p>
            <Link
              href="/checkins/current"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
            >
              {currentCheckin?.status === 'completed' ? 'View Check-in' : 'Complete Check-in'}
            </Link>
          </div>

          <div className="section-shell p-6">
            <h3 className="text-lg font-semibold text-neutral-900">Relationship Goals</h3>
            <p className="mt-2 text-sm text-neutral-500">
              {goals.length} active goal{goals.length !== 1 ? 's' : ''} keeping you focused together.
            </p>
            <Link
              href="/goals"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5"
            >
              View Goals
            </Link>
          </div>

          <div className="section-shell p-6">
            <h3 className="text-lg font-semibold text-neutral-900">New Argument</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Capture both perspectives and let Heka guide you toward resolution.
            </p>
            <button
              onClick={() => router.push('/arguments/create')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={!couple}
            >
              New Argument
            </button>
          </div>
        </div>

        {/* Couple Status */}
        <div className="section-shell p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Your Couple Profile</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Manage your shared space and keep both partners aligned.
              </p>
            </div>
            {!couple && (
              <button
                onClick={() => router.push('/couples/create')}
                className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5"
              >
                Create Couple Profile
              </button>
            )}
          </div>
          <div className="mt-6 rounded-2xl border border-white/40 bg-white/70 p-5">
            {couple ? (
              <div>
                <p className="text-sm font-semibold text-success-600">Active ✓</p>
                <p className="mt-2 text-sm text-neutral-600">You're connected and ready to collaborate.</p>
              </div>
            ) : (
              <p className="text-sm text-neutral-600">
                Invite your partner to create a couple profile and unlock shared insights.
              </p>
            )}
          </div>
        </div>

        {/* Goals Preview */}
        {goals.length > 0 && (
          <div className="section-shell p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Active Goals</h3>
              <Link
                href="/goals"
                className="text-sm font-semibold text-brand-600 transition-colors ease-soft-spring hover:text-brand-500"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-white/40 bg-white/70 p-5">
                  <h4 className="font-semibold text-neutral-900">{goal.title}</h4>
                  {goal.description && (
                    <p className="mt-2 text-sm text-neutral-500">{goal.description}</p>
                  )}
                  {goal.target_date && (
                    <p className="mt-2 text-xs text-neutral-400">
                      Target date: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Arguments List */}
        <div className="section-shell p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Your Arguments</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Revisit previous conflicts and keep momentum toward resolution.
              </p>
            </div>
            {couple && (
              <button
                onClick={() => router.push('/arguments/create')}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
              >
                New Argument
              </button>
            )}
          </div>

          {args.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">
              No arguments yet. Create your first argument to get started.
            </p>
          ) : (
            <div className="mt-6 grid gap-4">
              {args.map((arg) => (
                <button
                  key={arg.id}
                  onClick={() => router.push(`/arguments/${arg.id}`)}
                  className="rounded-2xl border border-white/40 bg-white/70 p-5 text-left transition-transform ease-soft-spring hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{arg.title}</h4>
                      <p className="mt-1 text-sm text-neutral-500">
                        Category: {arg.category} • Status: {arg.status}
                      </p>
                    </div>
                    <span
                      className={classNames(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        arg.priority === 'urgent'
                          ? 'bg-danger-100 text-danger-600'
                          : arg.priority === 'high'
                          ? 'bg-warning-100 text-warning-600'
                          : arg.priority === 'medium'
                          ? 'bg-brand-50 text-brand-600'
                          : 'bg-neutral-100 text-neutral-600'
                      )}
                    >
                      {arg.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

