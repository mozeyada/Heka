'use client';

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
    // Check authentication status
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // If we have a token but auth state isn't loaded, fetch user
    if (!isAuthenticated || !user) {
      fetchCurrentUser();
    }
    
    // Once authenticated, fetch couple and arguments
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
        // Fetch check-in and goals
        try {
          const checkin = await checkinsAPI.getCurrent();
          setCurrentCheckin(checkin);
        } catch (error) {
          console.error('Failed to fetch check-in:', error);
        }
        
        try {
          const goalsData = await goalsAPI.getAll();
          // Filter to active goals only for dashboard
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Heka</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-700 truncate max-w-[100px] sm:max-w-none">{user.name}</span>
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  router.push('/login');
                }}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onRetry={loadDashboardData} onDismiss={() => setError(null)} />
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Resolve arguments and build a stronger relationship together.
                </p>
              </div>
              {subscription && (
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  Manage Subscription
                </button>
              )}
            </div>
          </div>

          {/* Subscription Status Banner */}
          {subscription && subscription.tier === 'free' && (
            <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-yellow-900">Free Trial Active</h3>
                  {subscription.status === 'trial' && subscription.trial_end && (
                    <p className="text-xs sm:text-sm text-yellow-800 mt-1">
                      {usage && !usage.is_unlimited && (
                        <>
                          {usage.usage_count} / {usage.limit} arguments used
                          {usage.usage_count >= usage.limit && ' - Limit reached!'}
                        </>
                      )}
                      {usage && usage.is_unlimited && 'Trial ends '}
                      {new Date(subscription.trial_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-xs sm:text-sm whitespace-nowrap"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Usage Warning */}
          {usage && !usage.is_unlimited && usage.usage_count >= usage.limit && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-red-900">Usage Limit Reached</h3>
                  <p className="text-xs sm:text-sm text-red-800 mt-1">
                    You've used all {usage.limit} argument resolutions in your trial.
                    Upgrade to continue using Heka.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm whitespace-nowrap"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Weekly Check-in Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Check-in</h3>
              {currentCheckin?.status === 'completed' ? (
                <div className="text-green-600 text-sm mb-4">
                  ✓ Completed this week
                </div>
              ) : (
                <div className="text-orange-600 text-sm mb-4">
                  ⏰ Pending
                </div>
              )}
              <button
                onClick={() => router.push('/checkins/current')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {currentCheckin?.status === 'completed' ? 'View Check-in' : 'Complete Check-in'}
              </button>
            </div>

            {/* Goals Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Relationship Goals</h3>
              <div className="text-gray-600 text-sm mb-4">
                {goals.length} active goal{goals.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => router.push('/goals')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Goals
              </button>
            </div>

            {/* Arguments Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Arguments</h3>
              <div className="text-gray-600 text-sm mb-4">
                {args.length} total argument{args.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => router.push('/arguments/create')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!couple}
              >
                New Argument
              </button>
            </div>
          </div>

          {/* Couple Status */}
          <div className="mb-6 sm:mb-8 bg-white shadow rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Your Couple</h3>
            {couple ? (
              <div className="text-gray-700">
                <p>✓ Couple profile active</p>
                <p className="text-sm text-gray-500 mt-2">
                  Status: {couple.status}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  You're not in a couple yet. Create or join a couple to start resolving arguments.
                </p>
                <button
                  onClick={() => router.push('/couples/create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Couple Profile
                </button>
              </div>
            )}
          </div>

          {/* Active Goals Preview */}
          {goals.length > 0 && (
            <div className="mb-6 sm:mb-8 bg-white shadow rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Active Goals</h3>
                <button
                  onClick={() => router.push('/goals')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                        {goal.target_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {goal.progress && goal.progress.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {goal.progress_updates} update{goal.progress_updates !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arguments Section */}
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Your Arguments</h3>
              {couple && (
                <button
                  onClick={() => router.push('/arguments/create')}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  New Argument
                </button>
              )}
            </div>

            {args.length === 0 ? (
              <p className="text-gray-600">
                No arguments yet. Create your first argument to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {args.map((arg) => (
                  <div
                    key={arg.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/arguments/${arg.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{arg.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Category: {arg.category} • Status: {arg.status}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        arg.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        arg.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        arg.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {arg.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

