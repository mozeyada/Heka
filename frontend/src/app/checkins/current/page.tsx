'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { checkinsAPI } from '@/lib/api';

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [checkin, setCheckin] = useState<any>(null);
  const [responses, setResponses] = useState({
    question1: '',
    question2: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadCheckin();
  }, [isAuthenticated, router]);

  const loadCheckin = async () => {
    try {
      setLoading(true);
      const data = await checkinsAPI.getCurrent();
      setCheckin(data);
      if (data.responses) {
        setResponses(data.responses);
      }
    } catch (error: any) {
      console.error('Failed to load check-in:', error);
      setError('Failed to load check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responses.question1 || !responses.question2) {
      setError('Please answer both questions');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await checkinsAPI.complete(responses);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to complete check-in');
    } finally {
      setSubmitting(false);
    }
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

      <main className="max-w-3xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Weekly Relationship Check-in</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Take a moment to reflect on your relationship this week.
          </p>

          {checkin?.status === 'completed' ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✓ Check-in Completed</p>
                <p className="text-green-700 text-sm mt-1">
                  Completed on {checkin.completed_at ? new Date(checkin.completed_at).toLocaleDateString() : 'recently'}
                </p>
              </div>
              {checkin.responses && (
                <div className="space-y-4 mt-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Question 1: How are you feeling about communication this week?</h3>
                    <p className="text-gray-700">{checkin.responses.question1 || 'No response'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Question 2: Rate your relationship satisfaction (1-10) and why?</h3>
                    <p className="text-gray-700">{checkin.responses.question2 || 'No response'}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question 1: How are you feeling about communication this week?
                </label>
                <textarea
                  value={responses.question1}
                  onChange={(e) => setResponses({ ...responses, question1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your thoughts..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question 2: Rate your relationship satisfaction (1-10) and why?
                </label>
                <textarea
                  value={responses.question2}
                  onChange={(e) => setResponses({ ...responses, question2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Rate from 1-10 and explain why..."
                  required
                />
              </div>

              <div className="flex space-x-2 sm:space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? 'Submitting...' : 'Submit Check-in'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

