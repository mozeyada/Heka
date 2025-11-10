'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { goalsAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';

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
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <p className="text-sm text-neutral-500">Loading goals…</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Relationship Goals"
        description="Set shared goals to strengthen your partnership and celebrate growth together."
        actions={
          activeGoals.length < 3 ? (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              {showCreateForm ? 'Cancel' : 'New Goal'}
            </button>
          ) : null
        }
      />

      <div className="app-container max-w-4xl space-y-8">
        {error && (
          <div className="section-shell border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="section-shell p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Create New Goal</h2>
            <form onSubmit={handleCreateGoal} className="mt-6 space-y-6">
              <div>
                <label htmlFor="goal-title" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Goal title *
                </label>
                <input
                  id="goal-title"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="input-field mt-2"
                  placeholder="e.g., Have weekly date nights"
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <label htmlFor="goal-description" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Description (optional)
                </label>
                <textarea
                  id="goal-description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="input-field mt-2"
                  rows={3}
                  placeholder="Add more details about this goal..."
                />
              </div>
              <div>
                <label htmlFor="goal-date" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Target date (optional)
                </label>
                <input
                  id="goal-date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="input-field mt-2"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary"
                >
                  {creating ? 'Creating…' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGoal({ title: '', description: '', target_date: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeGoals.length === 0 && completedGoals.length === 0 && !showCreateForm && (
          <div className="section-shell p-10 text-center">
            <h3 className="text-lg font-semibold text-neutral-900">No goals yet</h3>
            <p className="mt-2 text-sm text-neutral-500">Create your first relationship goal to track progress together.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary mt-6"
            >
              Create Goal
            </button>
          </div>
        )}

        {activeGoals.length > 0 && (
          <div>
            <h2 className="mb-6 text-xl font-semibold text-neutral-900">Active Goals</h2>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="section-shell p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900">{goal.title}</h3>
                      {goal.description && (
                        <p className="mt-2 text-sm text-neutral-600">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="mt-2 text-xs text-neutral-400">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                      {goal.progress && goal.progress.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                            Recent Progress ({goal.progress_updates} update{goal.progress_updates !== 1 ? 's' : ''})
                          </p>
                          <div className="mt-3 space-y-2">
                            {goal.progress.slice(-3).map((p, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-indigo-100 bg-indigo-50/50 py-2 pl-3 pr-2 text-xs text-neutral-600"
                              >
                                <span className="font-semibold text-neutral-700">
                                  {p.date && new Date(p.date).toLocaleDateString()}
                                </span>
                                {p.notes && <span className="ml-2">— {p.notes}</span>}
                                {p.progress_value !== undefined && (
                                  <span className="ml-2 font-semibold text-indigo-600">
                                    ({Math.round(p.progress_value * 100)}%)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 sm:flex-col sm:shrink-0">
                      <button
                        onClick={() => router.push(`/goals/${goal.id}`)}
                        className="btn-secondary flex-1 sm:flex-none"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-500 hover:-translate-y-0.5 sm:flex-none"
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
            <h2 className="mb-6 text-xl font-semibold text-neutral-900">Completed Goals</h2>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="section-shell border-green-200 bg-green-50/30 p-6 opacity-80">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-neutral-900">{goal.title}</h3>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                          ✓ Completed
                        </span>
                      </div>
                      {goal.description && (
                        <p className="mt-2 text-sm text-neutral-600">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/goals/${goal.id}`)}
                      className="btn-secondary sm:shrink-0"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
