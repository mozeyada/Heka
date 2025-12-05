'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { checkinsAPI, aiSuggestionsAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checkin, setCheckin] = useState<any>(null);
  const [responses, setResponses] = useState({
    question1: '',
    question2: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadCheckin();
    if (checkin?.status !== 'completed') {
      loadAISuggestions();
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (checkin?.status !== 'completed') {
      loadAISuggestions();
    }
  }, [checkin]);

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
      setError(error.response?.data?.detail || error.message || 'Failed to load check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAISuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await aiSuggestionsAPI.getCheckinSuggestions();
      setAiSuggestions(response.suggestions || []);
    } catch (error: any) {
      console.error('Failed to load AI suggestions:', error);
      // Don't show error to user - suggestions are optional
    } finally {
      setLoadingSuggestions(false);
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
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <p className="text-sm text-neutral-500">Loading check-in…</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Weekly Check-in"
        description="A quick pulse on your relationship health—stay aligned and address small issues before they grow."
      />

      <div className="app-container max-w-3xl">
        {checkin?.status === 'completed' ? (
          <div className="space-y-6">
            <div className="section-shell border border-green-200 bg-green-50/60 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-green-600">Check-in completed</h3>
              <p className="mt-2 text-sm text-green-600">
                Submitted on {checkin.completed_at ? new Date(checkin.completed_at).toLocaleDateString() : 'recently'}
              </p>
            </div>

            {checkin.responses && (
              <div className="section-shell p-6">
                <h3 className="text-lg font-semibold text-neutral-900">Your Responses</h3>
                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      How are you feeling about communication this week?
                    </p>
                    <p className="mt-3 text-sm text-neutral-700">
                      {checkin.responses.question1 || 'No response'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Rate your relationship satisfaction (1-10) and why?
                    </p>
                    <p className="mt-3 text-sm text-neutral-700">
                      {checkin.responses.question2 || 'No response'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/dashboard"
              className="btn-primary inline-flex"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="section-shell border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="section-shell border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900">Personalized Reflection Questions</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Based on your recent arguments, consider these additional questions for deeper reflection.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-indigo-100 bg-white p-4"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {suggestion.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-700">{suggestion.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section-shell p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="q1" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    1. How are you feeling about communication this week?
                  </label>
                  <textarea
                    id="q1"
                    value={responses.question1}
                    onChange={(e) => setResponses({ ...responses, question1: e.target.value })}
                    className="input-field mt-3"
                    rows={4}
                    placeholder="Share your thoughts openly…"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="q2" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    2. Rate your relationship satisfaction (1-10) and explain why?
                  </label>
                  <textarea
                    id="q2"
                    value={responses.question2}
                    onChange={(e) => setResponses({ ...responses, question2: e.target.value })}
                    className="input-field mt-3"
                    rows={4}
                    placeholder="Rate from 1–10 and share context…"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Submitting…' : 'Submit Check-in'}
              </button>
              <Link
                href="/dashboard"
                className="btn-secondary inline-flex"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
