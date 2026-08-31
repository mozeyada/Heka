'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  MessageCircle,
  Heart,
  Shield,
  ChevronRight,
  Sparkles,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

const categoryIconMap: Record<string, { icon: LucideIcon; bg: string; color: string; label: string }> = {
  communication: { icon: MessageCircle, bg: 'bg-teal-500/10', color: 'text-teal-400', label: 'Communication' },
  values: { icon: Heart, bg: 'bg-rose-500/10', color: 'text-rose-400', label: 'Values' },
  trust: { icon: Shield, bg: 'bg-indigo-500/10', color: 'text-indigo-400', label: 'Trust' },
};
const defaultCategory = { icon: MessageCircle, bg: 'bg-white/5', color: 'text-zinc-400', label: 'Relationship' };

const formatDate = (isoDate?: string) => {
  if (!isoDate) return 'Unknown';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const priorityGlow: Record<string, string> = {
  urgent: 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
  high: 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.08)]',
  medium: 'border-white/10',
  low: 'border-white/5',
};
const priorityBadge: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-400 border border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  low: 'bg-white/5 text-zinc-500 border border-white/10',
};

const journeyPillMap: Record<string, { label: string; cls: string }> = {
  needs_reply: { label: 'Reply Needed', cls: 'bg-red-500/10 text-red-300 border border-red-500/20' },
  waiting_partner: { label: 'Waiting on Partner', cls: 'bg-orange-500/10 text-orange-300 border border-orange-500/20' },
  ready: { label: 'Ready for Insight', cls: 'bg-teal-500/10 text-teal-300 border border-teal-500/20' },
  stale: { label: 'New Context Added', cls: 'bg-amber-500/10 text-amber-300 border border-amber-500/20' },
  current: { label: 'Insight Current', cls: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' },
  archived: { label: 'Archived', cls: 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20' },
};

export default function ArgumentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const { arguments: args, fetchArguments, isLoading } = useArgumentsStore();
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const hasRequestedAuth = useRef(false);
  const hasLoadedArguments = useRef(false);

  const loadArguments = useCallback(async () => {
    try {
      setError(null);
      await fetchArguments();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load arguments. Please try again.');
    } finally {
      setHasInitialized(true);
    }
  }, [fetchArguments]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/login'); return; }
    if (isAuthenticated && user && !hasLoadedArguments.current) {
      hasLoadedArguments.current = true;
      loadArguments();
      return;
    }
    if ((!isAuthenticated || !user) && !hasRequestedAuth.current) {
      hasRequestedAuth.current = true;
      fetchCurrentUser().catch(() => { setError('Could not load your profile. Please refresh.'); setHasInitialized(true); }).finally(() => { hasRequestedAuth.current = false; });
    }
  }, [isAuthenticated, user, fetchCurrentUser, loadArguments, router]);

  if (!hasInitialized || isLoading || (!user && isAuthenticated)) return <LoadingPage />;

  const activeArguments = args.filter((a) => a.status !== 'resolved' && a.status !== 'archived');
  const resolvedArguments = args.filter((a) => a.status === 'resolved' || a.status === 'archived');
  const currentList = activeTab === 'active' ? activeArguments : resolvedArguments;

  return (
    <div className="min-h-screen text-zinc-300 pb-32 font-sans">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[20%] h-[40vh] w-[40vh] rounded-full bg-teal-900/20 blur-[130px]" />
        <div className="absolute bottom-[20%] right-[5%] h-[50vh] w-[50vh] rounded-full bg-indigo-900/15 blur-[150px]" />
      </div>

      <div className="app-container py-10 space-y-8 pb-28">
        {error && <ErrorAlert message={error} onRetry={() => { setHasInitialized(false); loadArguments(); }} onDismiss={() => setError(null)} />}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">Active Mediation</p>
            <h1 className="text-3xl font-medium tracking-tight text-white">Mediation Logs</h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-lg">
              Every conflict captured here. Share perspectives, receive AI insights, and guide your relationship toward resolution.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => { setHasInitialized(false); loadArguments(); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link href="/arguments/create" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02]">
              <Plus className="h-4 w-4" />
              Log Conflict
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {[
            { label: 'Total Logged', value: args.length, color: 'text-white' },
            { label: 'Active', value: activeArguments.length, color: 'text-orange-400' },
            { label: 'History', value: resolvedArguments.length, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl text-center">
              <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5 backdrop-blur-xl w-fit animate-in fade-in duration-700 delay-150">
          {(['active', 'history'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-white'}`}>
              {tab === 'active' ? `Active (${activeArguments.length})` : `History (${resolvedArguments.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {currentList.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 backdrop-blur-xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                {activeTab === 'active' ? <Sparkles className="h-7 w-7 text-teal-400 animate-pulse" /> : <CheckCircle2 className="h-7 w-7 text-emerald-400" />}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {activeTab === 'active' ? 'No active conflicts' : 'No history yet'}
              </h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8">
                {activeTab === 'active'
                  ? "You're in a great place. Use this time proactively to build alignment on key topics."
                  : 'Resolved and archived issues will appear here.'}
              </p>
              {activeTab === 'active' && (
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600">Proactive Conversation Starters</p>
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
                    {[
                      { label: 'Communication Habits', icon: MessageCircle, color: 'text-teal-400', topic: 'communication' },
                      { label: 'Financial Goals', icon: Zap, color: 'text-amber-400', topic: 'finances' },
                      { label: 'Shared Boundaries', icon: Shield, color: 'text-indigo-400', topic: 'values' },
                  ].map(({ label, icon: Icon, color, topic }) => (
                    <button key={topic} onClick={() => router.push(`/arguments/create?topic=${topic}`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">
                      <Icon className={`h-4 w-4 ${color}`} />
                      {label}
                    </button>
                  ))}
                  </div>
                  <Link href="/arguments/create" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02] mt-4">
                    <Plus className="h-4 w-4" />
                    Start Custom Session
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentList.map((arg) => {
                const { icon: CategoryIcon, bg, color, label } = categoryIconMap[arg.category?.toLowerCase() ?? ''] ?? defaultCategory;
                const journey = arg.status === 'archived'
                  ? journeyPillMap.archived
                  : arg.needs_user_response
                  ? journeyPillMap.needs_reply
                  : arg.insight_status === 'stale'
                    ? journeyPillMap.stale
                    : arg.can_generate_insight
                      ? journeyPillMap.ready
                      : arg.insight_status === 'current'
                        ? journeyPillMap.current
                        : journeyPillMap.waiting_partner;
                return (
                  <button key={arg.id} onClick={() => router.push(`/arguments/${arg.id}`)}
                    className={`w-full text-left rounded-3xl border bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl transition-all hover:bg-white/[0.04] group ${priorityGlow[arg.priority] ?? 'border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/5 ${bg} ${color}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-none">{arg.title}</h2>
                          {arg.priority && <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${priorityBadge[arg.priority] ?? ''}`}>{arg.priority}</span>}
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${journey.cls}`}>{journey.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-zinc-600">
                          <span>{label}</span>
                          <span>·</span>
                          <span>{arg.status}</span>
                          <span>·</span>
                          <FileText className="h-3 w-3" />
                          <span>{formatDate(arg.created_at)}</span>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                          {arg.needs_user_response
                            ? 'Your partner started a conversation. Add your side so Heka can help you both.'
                            : arg.status === 'archived'
                              ? 'Your partner stepped away from this issue. It stays here as archived context unless you remove it too.'
                              : arg.can_generate_insight
                                ? "Both sides are in. Open this conversation to get Heka's mediation."
                              : arg.insight_status === 'current'
                                ? 'This issue already has a current insight. Add more context only if the situation changed.'
                                : 'Your side is in. Waiting for your partner to share their perspective.'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-700 transition group-hover:text-white group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
