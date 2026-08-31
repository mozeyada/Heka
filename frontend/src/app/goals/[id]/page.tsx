'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Target,
  MessageCircle,
  Heart,
  Star,
  ThumbsUp,
  PlusCircle,
  Trash2,
  Calendar,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { couplesAPI, getApiErrorMessage, goalsAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';

interface GoalProgress {
  id: string;
  user_id: string;
  date: string;
  notes?: string;
  progress_value?: number;
  reactions: Array<{ user_id: string; emoji: string }>;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  target_date?: string;
  progress: GoalProgress[];
  created_by_user_id: string;
  momentum_state: string;
  needs_user_progress: boolean;
  next_action_title: string;
  next_action_description: string;
  latest_progress_id?: string;
  latest_progress_by_user_id?: string;
  latest_progress_at?: string;
  latest_progress_note?: string;
  latest_progress_value?: number;
  archived_for_current_user?: boolean;
}

const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '✨', label: 'Sparkles' },
];

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params?.id as string;
  const { user } = useAuthStore();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [partnerMap, setPartnerMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [progressValue, setProgressValue] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const fetchGoalAndPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalData, coupleData] = await Promise.all([
        goalsAPI.getById(goalId),
        couplesAPI.getMyCouple().catch(() => null),
      ]);
      setGoal(goalData);

      if (coupleData) {
        setPartnerMap({
          [coupleData.user1_id]: coupleData.user1_id === user?.id ? 'You' : coupleData.partner_name || 'Partner',
          [coupleData.user2_id]: coupleData.user2_id === user?.id ? 'You' : coupleData.partner_name || 'Partner',
        });
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to load goal'));
    } finally {
      setLoading(false);
    }
  }, [goalId, user?.id]);

  useEffect(() => {
    if (goalId) {
      fetchGoalAndPartners();
    }
  }, [fetchGoalAndPartners, goalId]);

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await goalsAPI.addProgress(goalId, {
        notes,
        progress_value: progressValue / 100,
      });
      setNotes('');
      setShowProgressForm(false);
      await fetchGoalAndPartners();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to add progress'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveGoal = async () => {
    if (!goal) return;
    const confirmed = window.confirm(
      'Are you sure you want to remove this goal from your active workspace?'
    );
    if (!confirmed) return;

    try {
      setArchiving(true);
      setError(null);
      await goalsAPI.archive(goal.id);
      router.push('/goals');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to remove goal'));
    } finally {
      setArchiving(false);
    }
  };

  const handleReact = async (progressId: string, emoji: string) => {
    try {
      await goalsAPI.reactToProgress(goalId, progressId, emoji);
      await fetchGoalAndPartners();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to react to update'));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-7 w-7 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-4 text-center">
        <h2 className="text-xl font-semibold text-white">Goal not found</h2>
        <p className="mt-2 text-sm text-zinc-400">This goal may have been archived or removed.</p>
        <Link href="/goals" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Link>
      </div>
    );
  }

  const isCompleted = goal.status === 'completed';
  const isArchived = goal.status === 'archived' || goal.archived_for_current_user;

  return (
    <div className="min-h-screen text-zinc-300 pb-32 font-sans relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[-10%] h-[48vh] w-[48vh] rounded-full bg-teal-900/15 blur-[150px]" />
        <div className="absolute top-[35%] right-[-10%] h-[55vh] w-[55vh] rounded-full bg-indigo-900/15 blur-[160px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <PageHeading
        title={goal.title}
        description={goal.description}
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleArchiveGoal}
              disabled={archiving}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {archiving ? 'Removing…' : 'Remove From My Space'}
            </button>
            <Link href="/goals" className="btn-secondary text-xs">
              Back
            </Link>
          </div>
        }
      />

      <div className="app-container max-w-3xl space-y-8">
        {error && (
          <div className="section-shell border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-300">{error}</p>
          </div>
        )}

        {/* Goal Meta Card */}
        <div className="section-shell p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Target className="w-4 h-4" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCompleted
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : isArchived
                    ? 'border border-zinc-700 bg-zinc-800/80 text-zinc-400'
                    : 'border border-teal-500/30 bg-teal-500/10 text-teal-300'
                }`}
              >
                {goal.status}
              </span>
            </div>

            {goal.target_date && (
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                Target: {new Date(goal.target_date).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-zinc-400">
              Created by <span className="font-medium text-white">{partnerMap[goal.created_by_user_id] || 'You'}</span>
            </p>
            {!isCompleted && !isArchived && (
              <button
                onClick={() => setShowProgressForm(!showProgressForm)}
                className="btn-primary flex items-center gap-2 text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add More Momentum
              </button>
            )}
          </div>
        </div>

        {/* Shared Journey Next Action */}
        {!isCompleted && !isArchived && goal.next_action_title && (
          <div className="section-shell p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">
                  Shared Journey
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {goal.next_action_title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {goal.next_action_description}
                </p>
              </div>
              <div className="shrink-0">
                <span
                  className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    goal.needs_user_progress
                      ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                  }`}
                >
                  {goal.needs_user_progress ? 'Your move' : 'Waiting on partner'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Latest Progress Highlight */}
        {goal.latest_progress_note && (
          <div className="section-shell p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Latest Shared Move
            </p>
            <div className="mt-3 rounded-xl border border-white/5 bg-black/30 p-4">
              <p className="text-xs text-zinc-400">
                <span className="font-semibold text-white">
                  {goal.latest_progress_by_user_id
                    ? partnerMap[goal.latest_progress_by_user_id] || 'Partner'
                    : 'A partner'}{' '}
                </span>
                {goal.latest_progress_at
                  ? `on ${new Date(goal.latest_progress_at).toLocaleDateString()}`
                  : ''}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-200">
                {goal.latest_progress_note}
              </p>
              {typeof goal.latest_progress_value === 'number' && (
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-semibold text-teal-400">
                    <span>Progress Pulse</span>
                    <span>{Math.round(goal.latest_progress_value * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all duration-700"
                      style={{ width: `${Math.max(5, goal.latest_progress_value * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Form */}
        {showProgressForm && (
          <form
            onSubmit={handleAddProgress}
            className="section-shell p-6 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <h3 className="font-semibold text-white text-base mb-4">
              Share Progress or Reflection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Update Note
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-field mt-1.5 resize-none"
                  placeholder="What is your next concrete move or thought on this goal?"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-2">
                  <span>How complete does this goal feel?</span>
                  <span className="text-teal-400">{progressValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary text-xs">
                  {submitting ? 'Posting…' : 'Post Momentum Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProgressForm(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Timeline */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-semibold text-white">Timeline</h3>

          {goal.progress.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <MessageCircle className="w-8 h-8 mx-auto text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-400">No updates logged yet.</p>
              <p className="text-xs text-zinc-600 mt-1">Be the first to share an update!</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 border-l border-teal-500/20 pb-4">
              {[...goal.progress].reverse().map((p, idx) => (
                <div key={p.id || idx} className="relative">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#050505] border-2 border-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />

                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-white text-sm">
                          {partnerMap[p.user_id] || 'You'}
                        </span>
                        <span className="text-zinc-500 text-xs ml-2">logged an update</span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(p.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {p.notes && (
                      <p className="text-zinc-300 bg-black/30 rounded-xl p-3.5 text-xs leading-relaxed mt-3 mb-3 border border-white/5">
                        {p.notes}
                      </p>
                    )}

                    {p.progress_value !== undefined && (
                      <div className="flex flex-col gap-1.5 mt-3">
                        <div className="flex justify-between text-xs font-semibold text-teal-400">
                          <span>Goal Progress</span>
                          <span>{Math.round(p.progress_value * 100)}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-400 to-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${p.progress_value * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Reactions Bar */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2 items-center">
                      {p.reactions && p.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mr-2">
                          {Array.from(new Set(p.reactions.map((r) => r.emoji))).map((emoji) => {
                            const count = p.reactions.filter((r) => r.emoji === emoji).length;
                            const hasReacted = p.reactions.some(
                              (r) => r.emoji === emoji && r.user_id === user?.id
                            );
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(p.id, emoji)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors border ${
                                  hasReacted
                                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-semibold text-[11px]">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {p.id && goal.status === 'active' && (
                        <div className="relative group">
                          <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span>React</span>
                          </button>

                          <div className="absolute top-full left-0 mt-1.5 bg-zinc-900/95 rounded-xl shadow-2xl border border-white/10 p-1.5 flex gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10 backdrop-blur-xl">
                            {EMOJI_OPTIONS.map((opt) => (
                              <button
                                key={opt.emoji}
                                onClick={() => handleReact(p.id, opt.emoji)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-base transition-transform hover:scale-125"
                                title={opt.label}
                              >
                                {opt.emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
