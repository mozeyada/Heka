'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { perspectivesAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';
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

  const statusBadge = () => {
    switch (currentArgument.status) {
      case 'resolved':
        return { label: 'Resolved', className: 'bg-success-100 text-success-600' };
      case 'in_progress':
        return { label: 'In Progress', className: 'bg-brand-50 text-brand-600' };
      default:
        return { label: 'Open', className: 'bg-warning-100 text-warning-600' };
    }
  };

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title={currentArgument.title}
        description="Review both perspectives, capture new insights, and see how Heka guides you back to common ground."
        actions={
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge().className}`}
          >
            {statusBadge().label}
          </span>
        }
      />

      <div className="app-container space-y-8">
        {error && (
          <div className="section-shell border border-danger-200 bg-danger-50/80 p-5">
            <p className="text-sm font-semibold text-danger-600">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="section-shell p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-neutral-900">Perspectives</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Both partners share their point of view to give Heka the full picture.
            </p>

            <div className="mt-6 space-y-4">
              {perspectives.length === 0 ? (
                <p className="rounded-2xl border border-white/40 bg-white/80 p-5 text-sm text-neutral-500">
                  No perspectives yet. Capture yours to get started.
                </p>
              ) : (
                perspectives.map((perspective, index) => (
                  <div
                    key={perspective.id}
                    className="rounded-2xl border border-white/40 bg-white/80 p-5"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-400">
                      <span>Perspective {index + 1}</span>
                      <span>{new Date(perspective.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-3 text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                      {perspective.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {!showPerspectiveForm ? (
              <button
                onClick={() => setShowPerspectiveForm(true)}
                className="mt-6 inline-flex rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
              >
                Add your perspective
              </button>
            ) : (
              <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Your perspective
                </label>
                <textarea
                  value={perspectiveContent}
                  onChange={(e) => setPerspectiveContent(e.target.value)}
                  rows={5}
                  placeholder="Describe what happened from your point of view"
                  className="mt-3 w-full rounded-xl border border-brand-200 bg-white/90 px-4 py-3 text-sm text-neutral-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAddPerspective}
                    disabled={isSubmitting}
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300"
                  >
                    {isSubmitting ? 'Saving…' : 'Save perspective'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPerspectiveForm(false);
                      setPerspectiveContent('');
                    }}
                    className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="section-shell p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Argument Details</h2>
            <div className="mt-4 space-y-4 text-sm text-neutral-500">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Category</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">
                  {currentArgument.category}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Priority</p>
                <p className="mt-1 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                  {currentArgument.priority}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Created</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {new Date(currentArgument.created_at).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/70 p-4 text-xs text-neutral-500">
                <p>
                  Need help outside this argument? Visit the{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/settings')}
                    className="font-semibold text-brand-600"
                  >
                    settings page
                  </button>{' '}
                  to export your data or delete your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-shell p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">AI Mediation Insights</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Heka analyzes both perspectives to highlight common ground, root causes, and next steps.
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || perspectives.length < 2}
              className="rounded-xl bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? 'Analyzing…' : 'Generate insights'}
            </button>
          </div>

          {!aiInsights && (
            <div className="mt-6 rounded-2xl border border-white/40 bg-white/75 p-5 text-sm text-neutral-500">
              {perspectives.length < 2
                ? 'Add at least two perspectives to unlock AI mediation.'
                : 'Click “Generate insights” to see tailored mediation guidance.'}
            </div>
          )}

          {aiInsights && !aiInsights?.safety_check?.blocked && (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                <h3 className="font-semibold text-neutral-900">Summary</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {aiInsights.summary}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-600">Common ground</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.common_ground.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Root causes</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.root_causes.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Key disagreements</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.disagreements.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/80 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Communication tips</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.communication_tips.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5">
                {aiInsights.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/40 bg-white/80 p-5">
                    <h4 className="font-semibold text-neutral-900">{suggestion.title}</h4>
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
            <div className="mt-6 rounded-2xl border border-danger-200 bg-danger-50/80 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-danger-600">Safety first</h3>
              <p className="mt-3 text-sm text-danger-600">
                {aiInsights?.safety_check?.reason || 'This conflict may require professional or emergency support.'}
              </p>
              <div className="mt-4">
                <CrisisResources showAcceptButton={false} />
              </div>
            </div>
          )}

          {safetyConcern && !aiInsights && (
            <div className="mt-6 rounded-2xl border border-danger-200 bg-danger-50/80 p-6">
              <p className="text-sm font-semibold text-danger-600">
                {safetyConcern.reason || 'AI insights are currently unavailable due to safety concerns.'}
              </p>
              <div className="mt-4">
                <CrisisResources showAcceptButton={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
