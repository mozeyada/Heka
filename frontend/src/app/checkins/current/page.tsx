'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  HeartHandshake,
  Lock,
  SendHorizontal,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { checkinsAPI, aiSuggestionsAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';
import { ErrorAlert } from '@/components/ErrorAlert';

type CheckinResponses = {
  question1: string;
  question2: string;
};

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checkin, setCheckin] = useState<any>(null);
  const [responses, setResponses] = useState<CheckinResponses>({
    question1: '',
    question2: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const loadCheckin = useCallback(async () => {
    try {
      setLoading(true);
      const data = await checkinsAPI.getCurrent();
      setCheckin(data);
      if (data.responses) {
        setResponses(data.responses);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAISuggestions = useCallback(async () => {
    try {
      const response = await aiSuggestionsAPI.getCheckinSuggestions();
      setAiSuggestions(response.suggestions || []);
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    loadCheckin();
  }, [isAuthenticated, loadCheckin, router]);

  useEffect(() => {
    if (checkin?.status !== 'completed') {
      loadAISuggestions();
    }
  }, [checkin?.status, loadAISuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responses.question1 || !responses.question2) {
      setError('Please answer both questions before submitting the check-in.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const updatedCheckin = await checkinsAPI.complete(responses);
      setCheckin(updatedCheckin);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswersBox = (title: string, answers: CheckinResponses, accent: 'teal' | 'indigo') => {
    const accentClasses =
      accent === 'teal'
        ? 'border-teal-500/20 bg-teal-500/[0.05]'
        : 'border-indigo-500/20 bg-indigo-500/[0.06]';

    return (
      <div className={`rounded-[1.75rem] border p-6 ${accentClasses}`}>
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
              accent === 'teal'
                ? 'border-teal-500/20 bg-teal-500/10 text-teal-300'
                : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <p className="text-xs text-zinc-500">Shared after both partners complete the sync.</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Communication this week
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-200">
              {answers?.question1 || 'No response'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Relationship satisfaction
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-200">
              {answers?.question2 || 'No response'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-teal-400" />
          <p className="mt-4 text-sm text-zinc-500">Loading your check-in telemetry…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[8%] h-[42vh] w-[42vh] rounded-full bg-teal-900/20 blur-[140px]" />
        <div className="absolute right-[-10%] top-[24%] h-[48vh] w-[48vh] rounded-full bg-indigo-900/20 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[36vh] w-[36vh] rounded-full bg-cyan-900/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <PageHeading
        title="Weekly Check-in"
        description="A quick pulse on your relationship health. Capture both perspectives, surface recurring themes, and keep small tensions from turning into larger issues."
        actions={
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container max-w-5xl space-y-8">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        <div className="section-shell overflow-hidden p-7 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${
                checkin?.needs_user_response
                  ? 'border border-amber-500/20 bg-amber-500/10 text-amber-300'
                  : checkin?.status === 'completed'
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : 'border border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
              }`}>
                {checkin?.needs_user_response ? <AlertCircle className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {checkin?.journey_state?.replace(/_/g, ' ') || 'weekly sync'}
              </div>
              <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">
                {checkin?.next_step_title || 'Start this week’s reflection.'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {checkin?.next_step_description}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 md:min-w-[280px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Shared context</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{checkin?.focus_summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  {checkin?.open_argument_count ?? 0} active issues
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  {checkin?.active_goal_count ?? 0} active goals
                </span>
              </div>
            </div>
          </div>
        </div>

        {checkin?.current_user_completed && !checkin?.partner_completed && (
          <div className="section-shell overflow-hidden p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-300">
                  <Lock className="h-3.5 w-3.5" />
                  Sync locked
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">You’re checked in.</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Your side is saved. Heka will unlock the comparison view and harmony report once your partner completes their weekly sync.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 md:min-w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Partner status</p>
                <p className="mt-3 text-lg font-semibold text-white">Awaiting response</p>
                <div className="mt-5 flex gap-2">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-400" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '0.1s' }} />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {checkin?.partner_completed && !checkin?.current_user_completed && (
          <div className="section-shell overflow-hidden p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Your response is needed
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">Your partner already checked in.</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Finish your reflection now to unlock the shared comparison and harmony report. Right now, the weekly ritual is waiting on you.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 md:min-w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Partner status</p>
                <p className="mt-3 text-lg font-semibold text-white">Checked in and waiting</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Your side is the missing half of the report.
                </p>
              </div>
            </div>
          </div>
        )}

        {checkin?.status === 'completed' && (
          <div className="space-y-8">
            <div className="section-shell overflow-hidden p-8 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Harmony report unlocked
                  </div>
                  <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">Shared pulse analysis</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Completed on{' '}
                    {checkin.completed_at ? new Date(checkin.completed_at).toLocaleDateString() : 'recently'}.
                    This is where both reflections and the AI synthesis come together.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  Two-sided view
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/12 to-cyan-500/8 p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Heka Harmony Report</h3>
                    <p className="text-sm text-zinc-300/80">A neutral synthesis of tone, friction, and alignment.</p>
                  </div>
                </div>

                {checkin.ai_harmony_report ? (
                  <div className="space-y-4 border-l border-teal-400/40 pl-5">
                    {checkin.ai_harmony_report.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index} className="text-sm leading-relaxed text-zinc-100">
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                    <Sparkles className="h-5 w-5 animate-pulse text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Generating your harmony report…</p>
                      <p className="text-xs text-zinc-500">Refresh in a few seconds if the synthesis has not appeared yet.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {renderAnswersBox('Your reflection', checkin.responses, 'teal')}
              {renderAnswersBox("Partner's reflection", checkin.partner_responses, 'indigo')}
            </div>
          </div>
        )}

        {!checkin?.current_user_completed && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {aiSuggestions.length > 0 && (
              <div className="section-shell p-7 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      Reflection prompts
                    </div>
                    <h2 className="mt-5 text-2xl font-medium tracking-tight text-white">
                      Personalized questions before you submit
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      These prompts are generated from recent conflict patterns so the weekly sync feels specific, not generic.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-zinc-400">
                    Two strongest prompts selected
                  </div>
                </div>

                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                    <div
                      key={index}
                      className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5 transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                        {suggestion.category}
                      </span>
                      <p className="mt-4 text-sm leading-relaxed text-zinc-200">{suggestion.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section-shell p-7 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Weekly sync</p>
                  <h2 className="mt-2 text-2xl font-medium tracking-tight text-white">Capture your side clearly</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-400">
                  Approx. 2 minutes
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <label htmlFor="q1" className="flex items-center gap-3 text-base font-semibold text-white">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/10 text-xs text-teal-300">1</span>
                    How are you feeling about communication this week?
                  </label>
                  <textarea
                    id="q1"
                    value={responses.question1}
                    onChange={(e) => setResponses({ ...responses, question1: e.target.value })}
                    className="input-field mt-4 min-h-[148px]"
                    placeholder="Share the tone, tension, or progress you noticed this week…"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="q2" className="flex items-center gap-3 text-base font-semibold text-white">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-300">2</span>
                    Rate your relationship satisfaction this week and explain why.
                  </label>
                  <textarea
                    id="q2"
                    value={responses.question2}
                    onChange={(e) => setResponses({ ...responses, question2: e.target.value })}
                    className="input-field mt-4 min-h-[148px]"
                    placeholder="Give a score from 1–10, then add the context behind it…"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center gap-2">
                <SendHorizontal className="h-4 w-4" />
                {submitting ? 'Submitting…' : checkin?.partner_completed ? 'Submit My Side and Unlock Report' : 'Submit Check-in'}
              </button>
              <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
