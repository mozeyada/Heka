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

  const usageCount = usage?.usage_count ?? 0;
  const usageLimit = usage?.limit ?? 0;
  const usagePercentage = usage?.is_unlimited
    ? 0
    : Math.min(Math.round((usageCount / Math.max(usageLimit, 1)) * 100), 100);
  const trialEndsOn = subscription?.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : null;

  if (!isAuthenticated || !user) {
    return <LoadingPage />;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-white pb-20">
      <div className="app-container py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">
              Welcome back, {user.name?.split(' ')[0] ?? user.name}.
            </h1>
            <p className="mt-2 text-base text-neutral-600">
              Track your relationship health, complete check-ins, and keep arguments moving toward resolution.
            </p>
          </div>
          {subscription && (
            <Link
              href="/subscription"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Manage subscription
            </Link>
          )}
        </div>

        {error && (
          <ErrorAlert message={error} onRetry={loadDashboardData} onDismiss={() => setError(null)} />
        )}

        {/* Free Trial Banner */}
        {subscription && subscription.tier === 'free' && (
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Free Trial Active</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {usageCount}/{usageLimit} arguments used
                  {trialEndsOn && ` • Trial ends ${trialEndsOn}`}
                </p>
              </div>
              <Link
                href="/subscription"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Arguments Left</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">
              {usage?.is_unlimited ? 'Unlimited' : `${usageLimit - usageCount}`}
            </p>
            {subscription?.tier === 'free' && trialEndsOn && (
              <p className="mt-2 text-sm text-neutral-500">
                Trial ends {trialEndsOn}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Weekly Check-in</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">
              {currentCheckin?.status === 'completed' ? '✓' : '—'}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {currentCheckin?.status === 'completed'
                ? 'Completed this week'
                : 'Stay aligned with a quick pulse'}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Goals</p>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">{goals.length}</p>
            <p className="mt-2 text-sm text-neutral-500">
              {goals.length > 0 ? 'Keep up the momentum' : 'Set a shared intention'}
            </p>
          </div>
        </div>

        {/* Usage Progress */}
        {!usage?.is_unlimited && usageLimit > 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-500 uppercase tracking-wide mb-4">
              <span>Usage Progress</span>
              <span>{usagePercentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usageCount >= usageLimit ? 'bg-red-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">Weekly Check-in</h3>
            <p className="mt-2 text-sm text-neutral-600">
              {currentCheckin?.status === 'completed' 
                ? 'Completed this week ✓' 
                : 'Stay aligned with a quick weekly pulse.'}
            </p>
            <Link
              href="/checkins/current"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              {currentCheckin?.status === 'completed' ? 'View Check-in' : 'Complete Check-in'}
            </Link>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">Relationship Goals</h3>
            <p className="mt-2 text-sm text-neutral-600">
              {goals.length} active goal{goals.length !== 1 ? 's' : ''} keeping you focused together.
            </p>
            <Link
              href="/goals"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              View Goals
            </Link>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">New Argument</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Capture both perspectives and let Heka guide you toward resolution.
            </p>
            <button
              onClick={() => router.push('/arguments/create')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!couple}
            >
              New Argument
            </button>
          </div>
        </div>

        {/* Couple Status */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Your Couple Profile</h3>
              <p className="mt-2 text-sm text-neutral-600">
                {couple 
                  ? "You're connected and ready to collaborate."
                  : 'Invite your partner to create a couple profile and unlock shared insights.'}
              </p>
            </div>
            {!couple && (
              <button
                onClick={() => router.push('/couples/create')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Create Couple Profile
              </button>
            )}
          </div>
          {couple && (
            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-semibold text-green-700">✓ Active • All sessions are shared</p>
            </div>
          )}
        </div>

        {/* Arguments List */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Your Arguments</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Revisit previous conflicts and keep momentum toward resolution.
              </p>
            </div>
            {couple && (
              <button
                onClick={() => router.push('/arguments/create')}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                New Argument
              </button>
            )}
          </div>

          {args.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No arguments yet. Create your first argument to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {args.slice(0, 5).map((arg) => (
                <button
                  key={arg.id}
                  onClick={() => router.push(`/arguments/${arg.id}`)}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{arg.title}</h4>
                      <p className="mt-1 text-sm text-neutral-500">
                        {arg.category} • {arg.status}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ${
                        arg.priority === 'urgent'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : arg.priority === 'high'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : arg.priority === 'medium'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
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
