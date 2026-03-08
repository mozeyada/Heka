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

  // --- RENDERING HELPERS ---
  const renderAnswersBox = (title: string, answers: any, isPartner: boolean = false) => (
    <div className={`rounded-2xl border p-5 ${isPartner ? 'border-indigo-100 bg-indigo-50/30' : 'border-neutral-200 bg-white'}`}>
      <h4 className="mb-4 text-sm font-bold text-neutral-900">{title}</h4>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Communication this week
          </p>
          <p className="mt-1.5 text-sm text-neutral-700">
            {answers?.question1 || 'No response'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Relationship satisfaction
          </p>
          <p className="mt-1.5 text-sm text-neutral-700">
            {answers?.question2 || 'No response'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Weekly Check-in"
        description="A quick pulse on your relationship health—stay aligned and address small issues before they grow."
      />

      <div className="app-container max-w-4xl">
        {/* STATE 1: AWAITING PARTNER (I Finished, Partner hasn't) */}
        {checkin?.status === 'awaiting_partner' && (
          <div className="space-y-6 text-center mt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">You're all set!</h2>
            <p className="mx-auto max-w-md text-neutral-600">
              Your check-in is saved. Your answers are currently locked and will be revealed once your partner completes their check-in for the week.
            </p>
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-8">
              <p className="text-sm font-medium text-indigo-900">Waiting for partner...</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-400"></span>
                <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '0.1s' }}></span>
                <span className="flex h-3 w-3 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/dashboard" className="btn-secondary inline-flex">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* STATE 2: COMPLETED (Both finished) */}
        {checkin?.status === 'completed' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Check-in Results</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Completed on {checkin.completed_at ? new Date(checkin.completed_at).toLocaleDateString() : 'recently'}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wide">
                Unlocked
              </span>
            </div>

            {/* AI Harmony Report */}
            {checkin.ai_harmony_report ? (
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Heka Harmony Report</h3>
                </div>
                {/* Render markdown style text safely */}
                <div className="prose prose-invert prose-indigo max-w-none">
                  {checkin.ai_harmony_report.split('\n\n').map((paragraph: string, i: number) => (
                    <p key={i} className="text-indigo-50 leading-relaxed font-medium">
                      {paragraph.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
             <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 text-center">
                <div className="mx-auto flex justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-indigo-900">Heka is generating your Harmony Report...</p>
                <p className="text-xs text-indigo-600 mt-1">Check back in a few seconds.</p>
             </div>
            )}

            {/* Answers Comparison */}
            <div className="grid gap-6 md:grid-cols-2 mt-8">
              {renderAnswersBox("Your Answers", checkin.responses, false)}
              {renderAnswersBox("Partner's Answers", checkin.partner_responses, true)}
            </div>

            <div className="pt-4 text-center">
              <Link href="/dashboard" className="btn-secondary inline-flex">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* STATE 3: PENDING (Needs to be filled out) */}
        {(checkin?.status === 'pending' || !checkin?.status) && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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

            <div className="section-shell p-6 md:p-8">
              <div className="space-y-8">
                <div>
                  <label htmlFor="q1" className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs text-indigo-700">1</span>
                    How are you feeling about communication this week?
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
                  <label htmlFor="q2" className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs text-indigo-700">2</span>
                    Rate your relationship satisfaction (1-10) and explain why?
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
