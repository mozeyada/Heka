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
          className: 'bg-green-100 text-green-700 border border-green-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          className: 'bg-blue-100 text-blue-700 border border-blue-200',
        };
      default:
        return {
          label: 'Open',
          className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        };
    }
  };

  const formatCategory = (value: string) =>
    value
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');

  const priorityTone: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  };

  const statusMeta = getStatusMeta();

  return (
    <div className="bg-neutral-25 pb-20">
      <div className="app-container py-8 space-y-8">
        <section className="section-shell p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span
                className={classNames(
                  'inline-flex items-center rounded-md px-3 py-1 text-xs font-medium border',
                  statusMeta.className
                )}
              >
                {statusMeta.label}
              </span>
              <h1 className="mt-4 text-2xl font-semibold text-neutral-900">{currentArgument.title}</h1>
              <p className="mt-2 text-sm text-neutral-600">
                Review both perspectives and get AI-powered insights to find common ground.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Category:</span>{' '}
                <span className="font-medium text-neutral-900">{formatCategory(currentArgument.category)}</span>
              </div>
              <div>
                <span className="text-neutral-500">Priority:</span>{' '}
                <span
                  className={classNames(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border capitalize',
                    priorityTone[currentArgument.priority] || 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  )}
                >
                  {currentArgument.priority}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Created:</span>{' '}
                <span className="text-neutral-700">
                  {new Date(currentArgument.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="section-shell bg-red-50 border-red-200 p-5">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.5fr)]">
          <div className="section-shell p-6">
            <header className="border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Perspectives</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Each partner shares their view to give the AI full context.
              </p>
            </header>

            <div className="mt-6 space-y-4">
              {perspectives.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">
                  No perspectives yet. Add yours to begin.
                </div>
              ) : (
                perspectives.map((perspective, index) => (
                  <article
                    key={perspective.id}
                    className="rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
                      <span className="font-medium">Perspective {index + 1}</span>
                      <span>{new Date(perspective.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                      {perspective.content}
                    </p>
                  </article>
                ))
              )}
            </div>

            {!showPerspectiveForm ? (
              <button
                onClick={() => setShowPerspectiveForm(true)}
                className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Add Your Perspective
              </button>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Your Perspective
                  </label>
                  <textarea
                    value={perspectiveContent}
                    onChange={(e) => setPerspectiveContent(e.target.value)}
                    rows={6}
                    placeholder="Describe what happened from your point of view. Focus on feelings, needs, and specific moments."
                    className="input-field mt-2"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAddPerspective}
                    disabled={isSubmitting}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving…' : 'Save Perspective'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPerspectiveForm(false);
                      setPerspectiveContent('');
                    }}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <div className="section-shell p-5">
              <h3 className="text-sm font-semibold text-neutral-900">Next Steps</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Add both perspectives, then generate AI insights to find common ground.
              </p>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Back to Dashboard →
              </button>
            </div>

            <div className="section-shell bg-blue-50 border-blue-200 p-5">
              <p className="text-xs font-semibold text-blue-900">Tip</p>
              <p className="mt-2 text-sm text-blue-700">
                A good perspective includes: what happened, how it made you feel, and what you need going forward.
              </p>
            </div>
          </aside>
        </section>

        <section className="section-shell p-6">
          <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">AI Insights</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Get personalized mediation insights based on both perspectives.
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || perspectives.length < 2}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing…' : 'Generate Insights'}
            </button>
          </div>

          {!aiInsights && (
            <div className="mt-6 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
              {perspectives.length < 2
                ? 'Add at least two perspectives to unlock AI insights.'
                : 'Click "Generate Insights" to get personalized mediation guidance.'}
            </div>
          )}

          {aiInsights && !aiInsights?.safety_check?.blocked && (
            <div className="mt-6 space-y-6">
              <div className="rounded-lg border border-neutral-200 bg-white p-5">
                <h3 className="text-base font-semibold text-neutral-900">Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">{aiInsights.summary}</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                  <h4 className="text-sm font-semibold text-green-700">Common Ground</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.common_ground.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                  <h4 className="text-sm font-semibold text-neutral-700">Root Causes</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.root_causes.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                  <h4 className="text-sm font-semibold text-neutral-700">Key Disagreements</h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.disagreements.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                  <h4 className="text-sm font-semibold text-neutral-700">
                    Communication Tips
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                    {aiInsights.communication_tips.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                {aiInsights.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-neutral-200 bg-white p-5"
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

              <p className="text-xs text-neutral-500">
                Generated {new Date(aiInsights.generated_at).toLocaleDateString()} • Model: {aiInsights.model_used}
              </p>
            </div>
          )}

          {aiInsights?.safety_check?.blocked && (
            <div className="mt-6 section-shell bg-red-50 border-red-200 p-6">
              <h3 className="text-sm font-semibold text-red-900">Safety Alert</h3>
              <p className="mt-2 text-sm text-red-700">
                {aiInsights?.safety_check?.reason || 'This conflict may require professional or emergency support.'}
              </p>
              <div className="mt-4">
                <CrisisResources showAcceptButton={false} />
              </div>
            </div>
          )}

          {safetyConcern && !aiInsights && (
            <div className="mt-6 section-shell bg-red-50 border-red-200 p-6">
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
