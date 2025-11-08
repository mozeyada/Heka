'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { goalsAPI } from '@/lib/api';

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  target_date?: string;
  progress: Array<{ date: string; notes?: string; progress_value?: number }>;
  progress_updates: number;
  created_at: string;
}

export default function GoalsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadGoals();
  }, [isAuthenticated, router]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsAPI.getAll();
      setGoals(data);
    } catch (error: any) {
      console.error('Failed to load goals:', error);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      setError('Goal title is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await goalsAPI.create(newGoal);
      setNewGoal({ title: '', description: '', target_date: '' });
      setShowCreateForm(false);
      loadGoals();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await goalsAPI.complete(goalId);
      loadGoals();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to complete goal');
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

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
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relationship Goals</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Set and track your relationship goals together</p>
          </div>
          {activeGoals.length < 3 && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap"
            >
              {showCreateForm ? 'Cancel' : 'New Goal'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-800">{error}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Create New Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Have weekly date nights"
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add more details about this goal..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date (optional)
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGoal({ title: '', description: '', target_date: '' });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeGoals.length === 0 && completedGoals.length === 0 && !showCreateForm && (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No goals yet. Create your first relationship goal!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Goal
            </button>
          </div>
        )}

        {activeGoals.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Active Goals</h2>
            <div className="space-y-3 sm:space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="bg-white shadow rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                      {goal.progress && goal.progress.length > 0 && (
                        <div className="mt-3 sm:mt-4">
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            Progress Updates: {goal.progress_updates}
                          </p>
                          <div className="space-y-1.5 sm:space-y-2">
                            {goal.progress.slice(-3).map((p, idx) => (
                              <div key={idx} className="text-xs text-gray-500 border-l-2 border-blue-500 pl-2 sm:pl-3">
                                {p.date && new Date(p.date).toLocaleDateString()}
                                {p.notes && ` - ${p.notes}`}
                                {p.progress_value !== undefined && (
                                  ` (${Math.round(p.progress_value * 100)}%)`
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-auto flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 sm:ml-4">
                      <button
                        onClick={() => router.push(`/goals/${goal.id}`)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-xs sm:text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Completed Goals</h2>
            <div className="space-y-3 sm:space-y-4">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="bg-white shadow rounded-lg p-4 sm:p-6 opacity-75">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-3 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {goal.title}
                        <span className="text-green-600 text-xs sm:text-sm">✓ Completed</span>
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/goals/${goal.id}`)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-xs sm:text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

