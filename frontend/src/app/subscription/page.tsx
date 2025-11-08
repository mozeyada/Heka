'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { subscriptionsAPI } from '@/lib/api';

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
  const { isAuthenticated, user } = useAuthStore();
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
      
      // Redirect to Stripe checkout
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

  const getTierDisplayName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'trial':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const isTrialActive = () => {
    if (!subscription || subscription.status !== 'trial') return false;
    if (!subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  };

  const daysRemaining = () => {
    if (!subscription?.trial_end) return 0;
    const end = new Date(subscription.trial_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription & Usage</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your subscription and track your usage</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-800">{error}</p>
          </div>
        )}

        {/* Current Subscription */}
        {subscription && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Current Subscription</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tier:</span>
                <span className="font-semibold">{getTierDisplayName(subscription.tier)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${getStatusColor(subscription.status)}`}>
                  {getTierDisplayName(subscription.status)}
                </span>
              </div>
              {subscription.status === 'trial' && subscription.trial_end && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trial Ends:</span>
                  <span className="font-semibold">
                    {formatDate(subscription.trial_end)} ({daysRemaining()} days remaining)
                  </span>
                </div>
              )}
              {subscription.current_period_end && subscription.status === 'active' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Renews:</span>
                  <span className="font-semibold">{formatDate(subscription.current_period_end)}</span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <p className="text-yellow-800 text-sm">
                    Your subscription will cancel at the end of the current billing period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        {usage && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Usage This Period</h2>
            <div className="space-y-4">
              {usage.is_unlimited ? (
                <div className="text-green-600 font-semibold">
                  ✓ Unlimited argument resolutions
                </div>
              ) : (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Argument Resolutions:</span>
                    <span className="font-semibold">
                      {usage.usage_count} / {usage.limit === -1 ? '∞' : usage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        usage.usage_count >= usage.limit ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (usage.usage_count / usage.limit) * 100)}%`,
                      }}
                    />
                  </div>
                  {usage.usage_count >= usage.limit && (
                    <p className="text-red-600 text-sm mt-2">
                      Limit reached! Upgrade to continue using Heka.
                    </p>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-4">
                Period: {formatDate(usage.period_start)} - {formatDate(usage.period_end)}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Options */}
        {subscription && subscription.tier === 'free' && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Upgrade Your Subscription</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Basic Tier */}
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Basic</h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">$9.99</div>
                <div className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">per month</div>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li>✓ Unlimited argument resolutions</li>
                  <li>✓ Weekly relationship check-ins</li>
                  <li>✓ Monthly relationship insights</li>
                  <li>✓ Basic communication exercises</li>
                  <li>✓ Historical argument tracking</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('basic')}
                  disabled={creatingCheckout === 'basic'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingCheckout === 'basic' ? 'Processing...' : 'Upgrade to Basic'}
                </button>
              </div>

              {/* Premium Tier */}
              <div className="border-2 border-blue-500 rounded-lg p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Popular
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Premium</h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">$19.99</div>
                <div className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">per month</div>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li>✓ Everything in Basic</li>
                  <li>✓ Advanced AI insights</li>
                  <li>✓ Unlimited communication exercises</li>
                  <li>✓ Relationship goal tracking</li>
                  <li>✓ Weekly relationship insights</li>
                  <li>✓ Preventive communication prompts</li>
                  <li>✓ Achievement badges & progress</li>
                  <li>✓ Priority support</li>
                </ul>
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={creatingCheckout === 'premium'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {creatingCheckout === 'premium' ? 'Processing...' : 'Upgrade to Premium'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message for Paid Subscriptions */}
        {subscription && subscription.tier !== 'free' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">
              ✓ Active Subscription
            </h3>
            <p className="text-sm sm:text-base text-green-800">
              Thank you for subscribing to Heka {getTierDisplayName(subscription.tier)}!
              You have full access to all features.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

