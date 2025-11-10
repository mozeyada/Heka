'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { perspectivesAPI } from '@/lib/api';
import { CrisisResources } from '@/components/CrisisResources';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AIInsight {
  id: string;
  summary: string;
  common_ground: string[];
  disagreements: string[];
  root_causes: string[];
  suggestions: Array<{
    title: string;
    description: string;
    actionable_steps: string[];
  }>;
  communication_tips: string[];
  generated_at: string;
  model_used: string;
  safety_check?: {
    blocked: boolean;
    reason?: string;
  };
}

interface Perspective {
  id: string;
  argument_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

function classNames(...classes: (string | null | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ArgumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const argumentId = params?.id as string;
  const { user } = useAuthStore();
  const { currentArgument, fetchArgumentById } = useArgumentsStore();
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPerspectiveForm, setShowPerspectiveForm] = useState(false);
  const [perspectiveContent, setPerspectiveContent] = useState('');
  const [safetyConcern, setSafetyConcern] = useState<any>(null);

  useEffect(() => {
    if (argumentId) {
      fetchArgumentById(argumentId);
      loadPerspectives();
      loadAIInsights();
    }
  }, [argumentId, fetchArgumentById]);

  const loadPerspectives = async () => {
    try {
      setIsLoading(true);
      const data = await perspectivesAPI.getByArgument(argumentId);
      setPerspectives(data);
    } catch (err) {
      setError('Failed to load perspectives');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/ai/arguments/${argumentId}/insights`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAIInsights(response.data);
      setSafetyConcern(response.data?.safety_check?.blocked ? response.data?.safety_check : null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAIInsights(null);
      } else {
        setError('Failed to load AI insights');
      }
    }
  };

  const handleAddPerspective = async () => {
    if (!perspectiveContent.trim()) {
      setError('Perspective cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await perspectivesAPI.create(argumentId, perspectiveContent.trim());
      setPerspectiveContent('');
      setShowPerspectiveForm(false);
      await loadPerspectives();
      await loadAIInsights();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to add perspective';
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/ai/arguments/${argumentId}/analyze`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAIInsights(response.data);
      setSafetyConcern(response.data?.safety_check?.blocked ? response.data?.safety_check : null);
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to analyze argument';
      if (err.response?.status === 403 && typeof detail === 'string' && detail.toLowerCase().includes('safety')) {
        setSafetyConcern({ blocked: true, reason: detail });
      }
      setError(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading && !currentArgument) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <p className="text-sm text-neutral-500">Loading argument…</p>
      </div>
    );
  }

  if (!currentArgument) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <div className="section-shell max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold text-neutral-900">Argument not found</h1>
          <p className="mt-2 text-sm text-neutral-500">It may have been deleted or you don’t have access.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusMeta = () => {
    switch (currentArgument.status) {
      case 'resolved':
        return {
          label: 'Resolved',
          className:
            'bg-gradient-to-r from-emerald-100/80 to-white text-emerald-600 border border-emerald-200/80 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          className:
            'bg-gradient-to-r from-indigo-100/80 to-white text-indigo-600 border border-indigo-200/70 shadow-[0_0_0_1px_rgba(99,102,241,0.1)]',
        };
      default:
        return {
          label: 'Open',
          className:
            'bg-gradient-to-r from-amber-100/80 to-white text-amber-600 border border-amber-200/70 shadow-[0_0_0_1px_rgba(217,119,6,0.1)]',
        };
    }
  };

  const formatCategory = (value: string) =>
    value
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');

  const priorityTone: Record<string, string> = {
    urgent: 'border-danger-200 bg-danger-50 text-danger-600',
    high: 'border-warning-200 bg-warning-50 text-warning-700',
    medium: 'border-indigo-200 bg-indigo-50 text-indigo-600',
    low: 'border-neutral-200 bg-neutral-100 text-neutral-600',
  };

  const statusMeta = getStatusMeta();

  return (
    <div className="relative overflow-hidden bg-neutral-25 pb-24 pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-100/70 via-white/40 to-transparent" />
        <div className="absolute right-[-20%] top-12 h-[420px] w-[420px] rounded-full bg-pink-200/40 blur-[140px]" />
        <div className="absolute left-[-15%] top-24 h-[360px] w-[360px] rounded-full bg-indigo-200/40 blur-[140px]" />
      </div>

      <div className="app-container space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_35px_90px_rgba(79,70,229,0.18)] backdrop-blur">
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-400/20 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute -left-14 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span
                className={classNames(
                  'inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em]',
                  statusMeta.className
                )}
              >
                {statusMeta.label}
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">{currentArgument.title}</h1>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Revisit both perspectives, track new developments, and let Heka surface the moments of connection hiding
                underneath the friction.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Category</p>
                <p className="mt-2 text-sm font-semibold text-neutral-900">{formatCategory(currentArgument.category)}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Priority</p>
                <span
                  className={classNames(
                    'mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
                    priorityTone[currentArgument.priority] || 'border-neutral-200 bg-neutral-100 text-neutral-600'
                  )}
                >
                  {currentArgument.priority}
                </span>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Created</p>
                <p className="mt-2 text-sm text-neutral-600">
                  {new Date(currentArgument.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-[28px] border border-danger-200 bg-danger-50/85 p-5 shadow-[0_24px_60px_rgba(220,38,38,0.14)] backdrop-blur">
            <p className="text-sm font-semibold text-danger-600">{error}</p>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <header className="flex flex-col gap-2 border-b border-neutral-100 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Perspectives</p>
              <h2 className="text-xl font-semibold text-neutral-900">Capture both voices</h2>
              <p className="text-sm text-neutral-500">
                When each partner shares calmly, the AI has the emotional context to mediate with nuance.
              </p>
            </header>

            <div className="mt-6 space-y-4">
              {perspectives.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-6 text-sm text-neutral-500">
                  No perspectives yet. Add yours to open the mediation space.
                </div>
              ) : (
                perspectives.map((perspective, index) => (
                  <article
                    key={perspective.id}
                    className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                      <span>Perspective {index + 1}</span>
                      <span>{new Date(perspective.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                      {perspective.content}
                    </p>
                  </article>
                ))
              )}
            </div>

            {!showPerspectiveForm ? (
              <button
                onClick={() => setShowPerspectiveForm(true)}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
              >
                Add your perspective
              </button>
            ) : (
              <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 shadow-[0_22px_55px_rgba(79,70,229,0.18)]">
                <label className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                  Your perspective
                </label>
                <textarea
                  value={perspectiveContent}
                  onChange={(e) => setPerspectiveContent(e.target.value)}
                  rows={6}
                  placeholder="Describe what happened from your point of view. Focus on feelings, needs, and specific moments."
                  className="mt-3 w-full rounded-2xl border border-indigo-100 bg-white/90 px-4 py-3 text-sm text-neutral-800 shadow-[0_0_0_1px_rgba(79,70,229,0.08)] transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-200/50"
                />
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddPerspective}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
                  >
                    {isSubmitting ? 'Saving…' : 'Save perspective'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPerspectiveForm(false);
                      setPerspectiveContent('');
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Next steps</p>
              <h3 className="mt-2 text-lg font-semibold text-neutral-900">Keep the relationship muscles warm</h3>
              <p className="mt-3 text-sm text-neutral-500">
                Revisit this conversation after each partner adds a perspective. Insight feels richer when both sides slow
                down enough to be heard fully.
              </p>
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="mt-5 inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
              >
                Manage data & safety
              </button>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Tip</p>
              <p className="mt-3 text-sm text-neutral-600">
                A perspective works best with three parts: what happened, how it made you feel, and what you need going
                forward. Keep it gentle and specific.
              </p>
            </div>
          </aside>
        </section>

        <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_35px_90px_rgba(79,70,229,0.16)] backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">AI mediation</p>
              <h2 className="text-xl font-semibold text-neutral-900">Insights tuned to both of you</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Once both perspectives are logged, Heka blends them into plain-language insights, scripts, and forward
                motion that respect each voice.
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || perspectives.length < 2}
              className="inline-flex items-center justify-center rounded-full bg-brand-gradient px-6 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_22px_55px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? 'Analyzing…' : 'Generate insights'}
            </button>
          </div>

          {!aiInsights && (
            <div className="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-6 text-sm text-indigo-700">
              {perspectives.length < 2
                ? 'Add at least two perspectives to unlock AI mediation.'
                : 'Tap “Generate insights” when you’re ready for Heka to synthesize what both of you shared.'}
            </div>
          )}

          {aiInsights && !aiInsights?.safety_check?.blocked && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <h3 className="text-lg font-semibold text-neutral-900">Summary</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{aiInsights.summary}</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Common ground</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.common_ground.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Root causes</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.root_causes.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Key disagreements</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.disagreements.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/85 p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
                    Communication tips
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.communication_tips.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5">
                {aiInsights.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
                  >
                    <h4 className="text-base font-semibold text-neutral-900">{suggestion.title}</h4>
                    <p className="mt-2 text-sm text-neutral-600">{suggestion.description}</p>
                    {suggestion.actionable_steps.length > 0 && (
                      <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                        {suggestion.actionable_steps.map((step, stepIdx) => (
                          <li key={stepIdx}>• {step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-neutral-400">
                Generated {new Date(aiInsights.generated_at).toLocaleString()} • Model: {aiInsights.model_used}
              </p>
            </div>
          )}

          {aiInsights?.safety_check?.blocked && (
            <div className="mt-6 rounded-2xl border border-danger-200 bg-danger-50/85 p-6 shadow-[0_24px_60px_rgba(220,38,38,0.15)]">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-danger-600">Safety first</h3>
              <p className="mt-3 text-sm text-danger-600">
                {aiInsights?.safety_check?.reason || 'This conflict may require professional or emergency support.'}
              </p>
              <div className="mt-4">
                <CrisisResources showAcceptButton={false} />
              </div>
            </div>
          )}

          {safetyConcern && !aiInsights && (
            <div className="mt-6 rounded-2xl border border-danger-200 bg-danger-50/85 p-6 shadow-[0_24px_60px_rgba(220,38,38,0.15)]">
              <p className="text-sm font-semibold text-danger-600">
                {safetyConcern.reason || 'AI insights are currently unavailable due to safety concerns.'}
              </p>
              <div className="mt-4">
                <CrisisResources showAcceptButton={false} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
