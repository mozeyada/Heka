"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Target,
  MessageCircle,
  Heart,
  Star,
  ThumbsUp,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { couplesAPI, getApiErrorMessage, goalsAPI } from "@/lib/api";
import { PageHeading } from "@/components/PageHeading";

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
  latest_progress_acknowledged_by_current_user: boolean;
  archived_for_current_user?: boolean;
}

const EMOJI_OPTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clap" },
  { emoji: "✨", label: "Sparkles" },
];

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [partnerMap, setPartnerMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progress Form
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressNotes, setProgressNotes] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const goalActionLabel = goal?.needs_user_progress
    ? "Add Your Next Step"
    : "Add More Momentum";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [goalData, coupleData] = await Promise.all([
        goalsAPI.getById(goalId),
        couplesAPI.getMyCouple(),
      ]);
      setGoal(goalData);

      // Build a map of user IDs to names for the timeline
      const map: Record<string, string> = {
        [user?.id || ""]: "You",
      };
      if (coupleData.partner_id) {
        map[coupleData.partner_id] =
          coupleData.partner_email?.split("@")[0] || "Partner";
      }
      setPartnerMap(map);

      if (goalData.progress?.length > 0) {
        // Set default progress value for the slider to the latest value
        const lastValue =
          goalData.progress[goalData.progress.length - 1].progress_value;
        if (lastValue) setProgressValue(Math.round(lastValue * 100));
      }
    } catch (error: any) {
      console.error("Failed to load goal:", error);
      setError(getApiErrorMessage(error, "Failed to load goal details."));
    } finally {
      setLoading(false);
    }
  }, [goalId, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, loadData, router]);

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await goalsAPI.updateProgress(goalId, {
        notes: progressNotes,
        progress_value: progressValue / 100,
      });
      setProgressNotes("");
      setShowProgressForm(false);
      loadData(); // Reload to get new progress
    } catch (error: any) {
      setError(getApiErrorMessage(error, "Failed to add progress."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReact = async (progressId: string, emoji: string) => {
    // Optimistic UI update could go here, but for simplicity we reload
    try {
      await goalsAPI.reactToProgress(goalId, progressId, emoji);
      loadData();
    } catch (error: any) {
      console.error("Failed to react:", error);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goal) return;

    const confirmed = window.confirm(
      goal.archived_for_current_user
        ? "Remove this archived goal from your space?"
        : "Remove this shared goal from your space? Your partner will keep it in archive.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await goalsAPI.delete(goalId);
      router.push("/goals");
    } catch (error: any) {
      setError(getApiErrorMessage(error, "Failed to delete goal."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <p className="text-sm text-neutral-500">Loading goal…</p>
      </div>
    );
  }

  if (!goal) return null;

  return (
    <div className="bg-neutral-25 pb-32 min-h-screen">
      <PageHeading
        title={goal.title}
        description={goal.description || "Track your collaborative progress"}
        actions={
          <div className="flex items-center gap-3">
            {goal.status !== "cancelled" && (
              <button
                type="button"
                onClick={handleDeleteGoal}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleting
                  ? "Removing..."
                  : goal.archived_for_current_user
                    ? "Remove From My Space"
                    : "Remove From My Space"}
              </button>
            )}
            <Link href="/goals" className="btn-secondary">
              Back
            </Link>
          </div>
        }
      />

      <div className="app-container max-w-3xl space-y-8">
        {error && (
          <div className="section-shell border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {goal.archived_for_current_user && (
          <div className="section-shell border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-sm font-semibold text-zinc-700">
              Your partner stepped away from this goal. It is archived for you
              as reference only, and new shared updates are closed.
            </p>
          </div>
        )}

        {/* Goal Metadata Header */}
        <div className="section-shell p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-900 border bg-white px-3 py-1 rounded-full text-xs tracking-wide uppercase">
                {goal.status}
              </span>
            </div>
            {goal.target_date && (
              <span className="text-sm font-medium text-neutral-500">
                Target: {new Date(goal.target_date).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">
              Created by{" "}
              <span className="font-medium text-neutral-900">
                {partnerMap[goal.created_by_user_id] || "You"}
              </span>
            </p>
            {goal.status === "active" && !goal.archived_for_current_user && (
              <button
                onClick={() => setShowProgressForm(!showProgressForm)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                {goalActionLabel}
              </button>
            )}
          </div>
        </div>

        <div className="section-shell p-6 bg-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">
                Shared Journey
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
                {goal.next_action_title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {goal.next_action_description}
              </p>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] ${
                goal.needs_user_progress
                  ? "border border-amber-200 bg-amber-50 text-amber-700"
                  : goal.momentum_state === "completed"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-indigo-200 bg-indigo-50 text-indigo-700"
              }`}
            >
              {goal.needs_user_progress
                ? "Your move"
                : goal.momentum_state.replace(/_/g, " ")}
            </div>
          </div>
          {goal.latest_progress_by_user_id && (
            <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-700">
                Latest momentum came from{" "}
                <span className="font-semibold text-neutral-950">
                  {partnerMap[goal.latest_progress_by_user_id] ||
                    "your partner"}
                </span>
                .
                {goal.latest_progress_by_user_id !== user?.id &&
                !goal.latest_progress_acknowledged_by_current_user
                  ? " You have not acknowledged that update yet."
                  : " The shared loop is currently visible to both of you."}
              </p>
            </div>
          )}
        </div>

        {(goal.latest_progress_note ||
          goal.latest_progress_value !== undefined) && (
          <div className="section-shell p-6 bg-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">
              Latest Shared Move
            </p>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-medium text-neutral-900">
                {partnerMap[goal.latest_progress_by_user_id || ""] ||
                  "Your partner"}{" "}
                moved this goal last
                {goal.latest_progress_at
                  ? ` on ${new Date(goal.latest_progress_at).toLocaleDateString()}`
                  : ""}
                .
              </p>
              {goal.latest_progress_note ? (
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  {goal.latest_progress_note}
                </p>
              ) : null}
              {goal.latest_progress_value !== undefined &&
              goal.latest_progress_value !== null ? (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-indigo-700">
                    <span>Progress pulse</span>
                    <span>{Math.round(goal.latest_progress_value * 100)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
                      style={{ width: `${goal.latest_progress_value * 100}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Create Progress Form */}
        {showProgressForm && (
          <form
            onSubmit={handleUpdateProgress}
            className="section-shell p-6 animate-slide-up bg-white"
          >
            <h3 className="font-semibold text-neutral-900 text-lg mb-4">
              {goal.needs_user_progress
                ? "Add Your Side of the Momentum"
                : "Extend the Shared Momentum"}
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Update Notes
                </label>
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="input-field mt-2"
                  rows={3}
                  placeholder={
                    goal.needs_user_progress
                      ? "What is your next concrete move on this shared goal?"
                      : "Add more context, support, or momentum around this goal."
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2 block">
                  How complete is this goal now? ({progressValue}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Posting..." : goalActionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProgressForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Social Timeline */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-neutral-900">Timeline</h3>

          {goal.progress.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl">
              <MessageCircle className="w-8 h-8 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">No progress logged yet.</p>
              <p className="text-sm text-neutral-400 mt-1">
                Be the first to share an update!
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8 border-l-2 border-indigo-100 pb-4">
              {/* Reverse to show newest first */}
              {[...goal.progress].reverse().map((p, idx) => (
                <div key={p.id || idx} className="relative animate-fade-in">
                  {/* Timeline Node */}
                  <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm" />

                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-neutral-900">
                          {partnerMap[p.user_id] || "You"}
                        </span>
                        <span className="text-neutral-500 text-sm ml-2">
                          logged an update
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 font-medium">
                        {new Date(p.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {p.notes && (
                      <p className="text-neutral-700 bg-neutral-50 rounded-xl p-4 text-sm mt-3 mb-4">
                        {p.notes}
                      </p>
                    )}

                    {p.progress_value !== undefined && (
                      <div className="flex flex-col gap-1.5 mt-4">
                        <div className="flex justify-between text-xs font-semibold text-indigo-700">
                          <span>Goal Progress</span>
                          <span>{Math.round(p.progress_value * 100)}%</span>
                        </div>
                        <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${p.progress_value * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Reactions Bar - Social Feature! */}
                    <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap gap-2 items-center">
                      {/* Render existing reactions grouped by emoji */}
                      {p.reactions && p.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mr-2">
                          {Array.from(
                            new Set(p.reactions.map((r) => r.emoji)),
                          ).map((emoji) => {
                            const count = p.reactions.filter(
                              (r) => r.emoji === emoji,
                            ).length;
                            const hasReacted = p.reactions.some(
                              (r) =>
                                r.emoji === emoji && r.user_id === user?.id,
                            );
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(p.id, emoji)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition-colors border ${hasReacted ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
                              >
                                <span>{emoji}</span>
                                <span className="font-medium text-xs">
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* "React" Add button - only if not completed */}
                      {p.id && goal.status === "active" && (
                        <div className="relative group">
                          <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                            <Star className="w-3.5 h-3.5" />
                            <span className="font-medium text-xs">React</span>
                          </button>

                          {/* Floating Emoji Picker Drawer */}
                          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-2 flex gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10 w-[170px]">
                            {EMOJI_OPTIONS.map((opt) => (
                              <button
                                key={opt.emoji}
                                onClick={() => handleReact(p.id, opt.emoji)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-xl transition-transform hover:scale-110"
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
