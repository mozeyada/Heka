'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { aiSuggestionsAPI, perspectivesAPI, argumentsAPI } from '@/lib/api';
import { CrisisResources } from '@/components/CrisisResources';
import { CementWinModal } from '@/components/arguments/CementWinModal';
import confetti from 'canvas-confetti';
import { Sparkles, ChevronLeft, Trash2, CheckCheck, RotateCcw, Plus, Brain, AlertTriangle } from 'lucide-react';

interface AIInsight {
  id: string; summary: string; common_ground: string[]; disagreements: string[]; root_causes: string[];
  suggestions: Array<{ title: string; description: string; actionable_steps: string[] }>;
  communication_tips: string[]; generated_at: string; model_used: string;
  safety_check?: { blocked: boolean; reason?: string };
}
interface SafetyCheck { blocked: boolean; reason?: string; }
interface Perspective { id: string; argument_id: string; user_id: string; content: string; created_at: string; }

export default function ArgumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const argumentId = params?.id as string;
  const { user } = useAuthStore();
  const { currentArgument, fetchArgumentById, clearCurrentArgument } = useArgumentsStore();
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCementModal, setShowCementModal] = useState(false);
  const [showPerspectiveForm, setShowPerspectiveForm] = useState(false);
  const [perspectiveContent, setPerspectiveContent] = useState('');
  const [safetyConcern, setSafetyConcern] = useState<SafetyCheck | null>(null);

  const loadPerspectives = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await perspectivesAPI.getByArgument(argumentId);
      setPerspectives(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load perspectives');
    } finally { setIsLoading(false); }
  }, [argumentId]);

  const loadAIInsights = useCallback(async () => {
    if (!currentArgument) return;

    const shouldFetchInsights =
      currentArgument.insight_status === 'current' ||
      currentArgument.insight_status === 'stale' ||
      currentArgument.status === 'analyzed';

    if (!shouldFetchInsights) {
      setAIInsights(null);
      setSafetyConcern(null);
      return;
    }

    try {
      const data = await aiSuggestionsAPI.getInsightsForArgument(argumentId);
      setAIInsights(data);
      setSafetyConcern(data?.safety_check?.blocked ? data?.safety_check : null);
    } catch (err: any) {
      if (err.response?.status !== 404) setError('Failed to load AI insights');
    }
  }, [argumentId, currentArgument]);

  useEffect(() => {
    if (argumentId) {
      fetchArgumentById(argumentId);
      loadPerspectives();
    }
  }, [argumentId, fetchArgumentById, loadPerspectives]);

  useEffect(() => {
    if (argumentId && currentArgument) {
      loadAIInsights();
    }
  }, [argumentId, currentArgument, loadAIInsights]);

  const handleAddPerspective = async () => {
    if (currentArgument?.status === 'archived') {
      setError('This issue is archived. Create a new issue if you want to continue the conversation.');
      return;
    }
    if (!perspectiveContent.trim()) { setError('Perspective cannot be empty'); return; }
    try {
      setIsSubmitting(true); setError(null);
      const existingPerspective = perspectives.find((p) => p.user_id === user?.id);
      if (existingPerspective) {
        await perspectivesAPI.updateMine(argumentId, perspectiveContent.trim());
      } else {
        await perspectivesAPI.create(argumentId, perspectiveContent.trim());
      }
      setPerspectiveContent(''); setShowPerspectiveForm(false);
      await Promise.all([
        loadPerspectives(),
        fetchArgumentById(argumentId),
      ]);
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to add perspective'); }
    finally { setIsSubmitting(false); }
  };

  const handleAnalyze = async () => {
    if (currentArgument?.status === 'archived') {
      setError('This issue is archived. Create a new issue if you want fresh mediation.');
      return;
    }
    try {
      setIsAnalyzing(true); setError(null);
      const data = await aiSuggestionsAPI.analyzeArgument(argumentId);
      setAIInsights(data);
      setSafetyConcern(data?.safety_check?.blocked ? data?.safety_check : null);
      await fetchArgumentById(argumentId);
      if (!data?.safety_check?.blocked) {
        Promise.all([
          aiSuggestionsAPI.generateArgumentGoals(argumentId),
          aiSuggestionsAPI.generateArgumentCheckins(argumentId)
        ]).catch((err: any) => {
          setError(err.response?.data?.detail || 'Failed to generate AI follow-up suggestions. You can try again from the Cement the Win menu.');
        });
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to analyze argument';
      if (err.response?.status === 403 && typeof detail === 'string' && detail.toLowerCase().includes('safety')) setSafetyConcern({ blocked: true, reason: detail });
      setError(detail);
    } finally { setIsAnalyzing(false); }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (currentArgument?.status === 'archived') {
      setError('Archived issues are read-only. Create a new issue if you want to reopen the conversation.');
      return;
    }
    try {
      setIsUpdatingStatus(true); setError(null);
      await argumentsAPI.updateStatus(argumentId, newStatus);
      useArgumentsStore.getState().fetchArgumentById(argumentId);
      if (newStatus === 'resolved') { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); setTimeout(() => setShowCementModal(true), 1500); }
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to update status'); }
    finally { setIsUpdatingStatus(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(
      currentArgument?.status === 'archived'
        ? 'Remove this archived issue from your space?'
        : 'Remove this issue from your space? Your partner will still keep it in archive.'
    )) return;
    try {
      setIsDeleting(true); setError(null);
      await argumentsAPI.delete(argumentId);
      clearCurrentArgument(); router.push('/arguments');
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to delete'); setIsDeleting(false); }
  };

  if (isLoading && !currentArgument) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
    </div>
  );

  if (!currentArgument) return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 backdrop-blur-xl text-center max-w-sm">
        <h1 className="text-lg font-medium text-white mb-2">Argument not found</h1>
        <p className="text-sm text-zinc-500 mb-6">It may have been deleted or you don't have access.</p>
        <button onClick={() => router.push('/arguments')} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-[1.02]">Back to Logs</button>
      </div>
    </div>
  );

  const formatCategory = (v: string) => v.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const statusConfig: Record<string, { label: string; cls: string }> = {
    resolved: { label: 'Resolved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    active: { label: 'Active', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    analyzed: { label: 'Analyzed', cls: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    draft: { label: 'Collecting Context', cls: 'bg-white/5 text-zinc-400 border-white/10' },
  };
  const { label: statusLabel, cls: statusCls } = statusConfig[currentArgument.status] ?? statusConfig.active;
  const priorityTone: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    low: 'bg-white/5 text-zinc-500 border-white/10',
  };
  const currentUserPerspective = perspectives.find((p) => p.user_id === user?.id);
  const partnerPerspective = perspectives.find((p) => p.user_id !== user?.id);
  const journeyHeadline = currentArgument.needs_user_response
    ? 'Your partner is waiting on your side of the story.'
    : currentArgument.status === 'archived'
      ? 'This issue is archived in your space.'
    : currentArgument.can_generate_insight
      ? 'Both perspectives are in. Heka can generate the mediation insight now.'
      : currentArgument.insight_status === 'current'
        ? 'The current insight is up to date.'
        : currentArgument.insight_status === 'stale'
          ? 'New context was added. Regenerate the insight when you are ready.'
          : 'Your side is in. The next move belongs to your partner.';
  const journeyCopy = currentArgument.needs_user_response
    ? 'Add your perspective so the conflict moves out of limbo and into a full two-sided mediation.'
    : currentArgument.status === 'archived'
      ? 'Your partner stepped away from this issue. It remains here only as archived context unless you remove it from your side too.'
    : currentArgument.can_generate_insight
      ? 'There is enough context to analyze without asking either partner to repeat themselves.'
      : currentArgument.insight_status === 'current'
        ? 'Do not re-run the AI unless someone added meaningful new context.'
        : currentArgument.insight_status === 'stale'
          ? 'The existing insight is now outdated because one side added or revised context.'
          : 'Your partner still needs to respond before the AI should be involved.';

  return (
    <div className="min-h-screen text-zinc-300 pb-32 font-sans">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] h-[50vh] w-[40vh] rounded-full bg-teal-900/15 blur-[140px]" />
        <div className="absolute bottom-[10%] right-[5%] h-[45vh] w-[45vh] rounded-full bg-indigo-900/15 blur-[140px]" />
      </div>

      <div className="app-container py-10 space-y-8 pb-28">
        {/* Breadcrumb & Privacy Badge */}
        <div className="flex items-center justify-between animate-in fade-in duration-500">
          <button onClick={() => router.push('/arguments')} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition">
            <ChevronLeft className="h-4 w-4" />
            Back to Mediation Logs
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/10 bg-teal-500/5 px-3 py-1 text-[10px] font-medium text-teal-400 backdrop-blur-md shadow-[0_0_15px_rgba(45,212,191,0.05)]">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted at Rest
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-300">{error}</p>
          </div>
        )}

        {/* Issue Header */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusCls}`}>{statusLabel}</span>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest capitalize ${priorityTone[currentArgument.priority] ?? priorityTone.low}`}>{currentArgument.priority}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{formatCategory(currentArgument.category)}</span>
              </div>
              <h1 className="text-2xl font-medium tracking-tight text-white mb-2">{currentArgument.title}</h1>
              <p className="text-xs text-zinc-600">Logged {new Date(currentArgument.created_at).toLocaleDateString()}</p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              {currentArgument.status !== 'resolved' && currentArgument.status !== 'archived' ? (
                <button onClick={() => handleStatusUpdate('resolved')} disabled={isUpdatingStatus} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] transition hover:scale-[1.02] disabled:opacity-50">
                  <CheckCheck className="h-4 w-4" />
                  {isUpdatingStatus ? 'Updating…' : 'Mark Resolved'}
                </button>
              ) : currentArgument.status === 'resolved' ? (
                <button onClick={() => handleStatusUpdate('active')} disabled={isUpdatingStatus} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-50">
                  <RotateCcw className="h-4 w-4" />
                  {isUpdatingStatus ? 'Updating…' : 'Reopen'}
                </button>
              ) : null}
              <button onClick={() => setShowCementModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 text-xs font-bold text-teal-300 transition hover:bg-teal-500/20">
                🌱 Action Plan
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Removing…' : 'Remove From My Space'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Journey State</p>
              <h2 className="mt-2 text-xl font-medium text-white">{journeyHeadline}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{journeyCopy}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                currentArgument.needs_user_response
                  ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                  : currentArgument.can_generate_insight
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                    : currentArgument.insight_status === 'current'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : currentArgument.insight_status === 'stale'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-orange-500/10 text-orange-300 border border-orange-500/20'
              }`}>
                {currentArgument.needs_user_response
                  ? 'Reply needed'
                  : currentArgument.can_generate_insight
                    ? 'Ready for insight'
                    : currentArgument.insight_status === 'current'
                      ? 'Insight current'
                      : currentArgument.insight_status === 'stale'
                        ? 'Insight stale'
                        : 'Waiting on partner'}
              </span>
            </div>
          </div>
        </div>

        {/* Perspectives + Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {/* Perspectives */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-sm font-semibold text-white">Perspectives</h2>
                <p className="text-xs text-zinc-500 mt-1">Each partner shares their view to give the AI full context.</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-600">{perspectives.length}/2 submitted</span>
            </div>

              {perspectives.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-zinc-600">No perspectives yet. Add yours to begin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {perspectives.map((p) => {
                  const isMine = p.user_id === user?.id;
                  return (
                  <article key={p.id} className={`rounded-2xl border p-6 ${isMine ? 'border-teal-500/20 bg-teal-500/[0.05]' : 'border-white/10 bg-black/20'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                        {isMine ? 'Your Perspective' : 'Partner Perspective'}
                      </span>
                      <span className="text-[10px] text-zinc-600">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-line border-l-2 border-teal-500/30 pl-4">{p.content}</p>
                  </article>
                )})}
              </div>
            )}

            {currentArgument.status === 'archived' ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-zinc-400">
                  This issue is archived. New shared context is closed unless you start a fresh issue.
                </p>
              </div>
            ) : !showPerspectiveForm ? (
              <button
                onClick={() => {
                  setPerspectiveContent(currentUserPerspective?.content ?? '');
                  setShowPerspectiveForm(true);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                {currentUserPerspective ? 'Add More Context' : 'Add Your Perspective'}
              </button>
            ) : (
              <div className="mt-8 space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Your Perspective</label>
                <textarea
                  value={perspectiveContent}
                  onChange={(e) => setPerspectiveContent(e.target.value)}
                  rows={6}
                  placeholder="Describe what happened from your point of view. Focus on feelings, needs, and specific moments."
                  className="w-full mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={handleAddPerspective} disabled={isSubmitting} className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition hover:scale-[1.02] disabled:opacity-50">
                    {isSubmitting ? 'Saving…' : currentUserPerspective ? 'Save Updated Context' : 'Save Perspective'}
                  </button>
                  <button onClick={() => { setShowPerspectiveForm(false); setPerspectiveContent(''); }} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Next Steps</h3>
              <ol className="space-y-3">
                {[
                  currentArgument.current_user_has_perspective ? 'Your side is recorded' : 'Add your perspective',
                  currentArgument.partner_has_perspective ? "Partner's side is recorded" : 'Wait for partner response',
                  currentArgument.can_generate_insight ? 'Generate or refresh insights' : 'Unlock insights with both sides',
                  'Review guidance and resolve when ready',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-zinc-400">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                      (i === 0 && currentArgument.current_user_has_perspective) ||
                      (i === 1 && currentArgument.partner_has_perspective) ||
                      (i === 2 && currentArgument.insight_status === 'current')
                        ? 'bg-teal-500 text-black'
                        : 'border border-white/20 text-zinc-600'
                    }`}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 backdrop-blur-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Pro Tip</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Include what happened, how it made you feel, and what you need going forward.</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-teal-400" />
                AI Mediation Insights
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Personalized guidance generated from both perspectives.</p>
            </div>
            <button onClick={handleAnalyze} disabled={isAnalyzing || !currentArgument.can_generate_insight || currentArgument.status === 'archived'}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              <Sparkles className="h-4 w-4" />
              {isAnalyzing
                ? 'Analyzing…'
                : currentArgument.insight_status === 'stale'
                  ? 'Regenerate Insights'
                  : currentArgument.insight_status === 'current'
                    ? 'Insights Current'
                    : 'Generate Insights'}
            </button>
          </div>

          {!aiInsights && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center">
              <Sparkles className="h-8 w-8 text-zinc-700 mx-auto mb-3 animate-pulse" />
              <p className="text-sm text-zinc-500">
                {currentArgument.needs_user_response
                  ? 'Your response is still missing. Add it to unlock the mediation flow.'
                  : !currentArgument.partner_has_perspective
                    ? 'Waiting for your partner to add their perspective.'
                    : 'Ready — generate the mediation insight when you want Heka to synthesize both sides.'}
              </p>
            </div>
          )}

          {aiInsights && !aiInsights?.safety_check?.blocked && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">Analysis Summary</p>
                <p className="text-sm leading-relaxed text-zinc-300">{aiInsights.summary}</p>
              </div>

              {/* 2-col grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: 'Common Ground', items: aiInsights.common_ground, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                  { title: 'Root Causes', items: aiInsights.root_causes, color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
                  { title: 'Key Disagreements', items: aiInsights.disagreements, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
                  { title: 'Communication Tips', items: aiInsights.communication_tips, color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5' },
                ].map(({ title, items, color, border, bg }) => (
                  <div key={title} className={`rounded-2xl border p-5 ${border} ${bg}`}>
                    <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${color}`}>{title}</h4>
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                          <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${color.replace('text-', 'bg-')}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              {aiInsights.suggestions.map((s, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                  <h4 className="text-sm font-semibold text-white mb-2">{s.title}</h4>
                  <p className="text-xs text-zinc-400 mb-4">{s.description}</p>
                  {s.actionable_steps.length > 0 && (
                    <ul className="space-y-2">
                      {s.actionable_steps.map((step, si) => (
                        <li key={si} className="flex items-start gap-2 text-xs text-zinc-500">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <p className="text-[10px] text-zinc-600">Generated {new Date(aiInsights.generated_at).toLocaleDateString()} · Model: {aiInsights.model_used}</p>
            </div>
          )}

          {(aiInsights?.safety_check?.blocked || (safetyConcern && !aiInsights)) && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-sm font-semibold text-red-300">Safety Alert</h3>
              </div>
              <p className="text-xs text-red-300/70 mb-4">{aiInsights?.safety_check?.reason || safetyConcern?.reason || 'This conflict may require professional or emergency support.'}</p>
              <CrisisResources showAcceptButton={false} />
            </div>
          )}
        </div>
      </div>
      <CementWinModal isOpen={showCementModal} onClose={() => setShowCementModal(false)} argumentId={argumentId} />
    </div>
  );
}
