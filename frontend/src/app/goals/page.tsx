"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Target,
  CheckCircle2,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { goalsAPI, aiSuggestionsAPI } from "@/lib/api";

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  target_date?: string;
  progress: Array<{ date: string; notes?: string; progress_value?: number }>;
  progress_updates: number;
  created_at: string;
  momentum_state: string;
  needs_user_progress: boolean;
  next_action_title: string;
  next_action_description: string;
  latest_progress_by_user_id?: string | null;
  latest_progress_at?: string | null;
  latest_progress_note?: string | null;
  latest_progress_value?: number | null;
}

export default function GoalsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_date: "",
    first_step: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !isAuthenticated) {
      router.push("/login");
      return;
    }
    loadGoals();
    loadAISuggestions();
  }, [isAuthenticated, router]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setGoals(await goalsAPI.getAll());
    } catch (e: any) {
      setError(
        e.response?.data?.detail || e.message || "Failed to load goals.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      setError("Goal title is required");
      return;
    }
    if (!newGoal.first_step.trim()) {
      setError("Add the first concrete move you will take");
      return;
    }
    try {
      setCreating(true);
      setError(null);
      const createdGoal = await goalsAPI.create(newGoal);
      setNewGoal({
        title: "",
        description: "",
        target_date: "",
        first_step: "",
      });
      setShowCreateForm(false);
      router.push(`/goals/${createdGoal.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create goal");
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await goalsAPI.complete(goalId);
      loadGoals();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to complete goal");
    }
  };

  const loadAISuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await aiSuggestionsAPI.getGoalSuggestions();
      setAiSuggestions(res.suggestions || []);
    } catch {
      /* silent */
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCreateFromSuggestion = async (suggestion: any) => {
    try {
      setCreating(true);
      setError(null);
      const createdGoal = await goalsAPI.create({
        title: suggestion.title,
        description: suggestion.description,
        first_step:
          "I am opening this goal so we can agree on our first concrete move this week.",
      });
      setAiSuggestions(
        aiSuggestions.filter((s) => s.title !== suggestion.title),
      );
      router.push(`/goals/${createdGoal.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to create goal");
    } finally {
      setCreating(false);
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen text-zinc-300 pb-32 font-sans">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] right-[10%] h-[45vh] w-[45vh] rounded-full bg-indigo-900/15 blur-[140px]" />
        <div className="absolute bottom-[15%] left-[5%] h-[40vh] w-[40vh] rounded-full bg-teal-900/10 blur-[130px]" />
      </div>

      <div className="app-container py-10 space-y-8 pb-28">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Growth Engine
            </p>
            <h1 className="text-3xl font-medium tracking-tight text-white">
              Relationship Goals
            </h1>
            <p className="mt-2 text-sm text-zinc-400 max-w-lg">
              Set shared milestones, track meaningful progress, and celebrate
              growth together.
            </p>
          </div>
          {activeGoals.length < 10 && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shrink-0 ${showCreateForm ? "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10" : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"}`}
            >
              {showCreateForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  New Goal
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm font-semibold text-red-300">{error}</p>
          </div>
        )}

        {/* Create Goal Form */}
        {showCreateForm && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-sm font-semibold text-white mb-2">
              Define New Objective
            </h2>
            <p className="mb-6 max-w-2xl text-xs leading-relaxed text-zinc-500">
              Shared goals should begin with an actual first move, not just a
              title. Start the path with one concrete step so your partner can
              answer with theirs.
            </p>
            <form onSubmit={handleCreateGoal} className="space-y-5">
              <div>
                <label
                  htmlFor="goal-title"
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  Goal Title *
                </label>
                <input
                  id="goal-title"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="e.g., Have weekly date nights"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition"
                  required
                  maxLength={255}
                />
              </div>
              <div>
                <label
                  htmlFor="goal-description"
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  Description (optional)
                </label>
                <textarea
                  id="goal-description"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Add more context or success criteria..."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition resize-none"
                />
              </div>
              <div>
                <label
                  htmlFor="goal-first-step"
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  Your First Step *
                </label>
                <textarea
                  id="goal-first-step"
                  value={newGoal.first_step}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, first_step: e.target.value })
                  }
                  rows={3}
                  placeholder="What will you actually do first to move this goal forward?"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition resize-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="goal-date"
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  Target Date (optional)
                </label>
                <input
                  id="goal-date"
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target_date: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition [color-scheme:dark]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02] disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Set Objective"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGoal({
                      title: "",
                      description: "",
                      target_date: "",
                      first_step: "",
                    });
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && !showCreateForm && (
          <div className="rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-8 backdrop-blur-2xl animate-in fade-in duration-700 delay-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/20">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Focused Goal Tracks
                </h3>
                <p className="text-xs text-zinc-500">
                  Only the strongest shared moves are surfaced first, so this
                  stays manageable.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {aiSuggestions.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 flex flex-col"
                >
                  <div className="flex-1 space-y-1 mb-4">
                    <h4 className="text-xs font-semibold text-white">
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                    {s.category && (
                      <span className="inline-block mt-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                        {s.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCreateFromSuggestion(s)}
                    disabled={creating}
                    className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500/20 disabled:opacity-50"
                  >
                    {creating ? "Adding…" : "Add This Goal"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeGoals.length === 0 &&
          completedGoals.length === 0 &&
          !showCreateForm && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-14 backdrop-blur-2xl text-center animate-in fade-in duration-700 delay-200">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <Target className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No objectives set yet
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
                {!loadingSuggestions && aiSuggestions.length === 0
                  ? "Setting shared relationship goals helps you align on your future and track meaningful progress together."
                  : "Or create a custom goal that matters to both of you."}
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02]"
              >
                Create Custom Goal
              </button>
            </div>
          )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Active Objectives ({activeGoals.length})
            </p>
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                        {goal.description}
                      </p>
                    )}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          goal.needs_user_progress
                            ? "bg-amber-500/10 text-amber-300"
                            : goal.momentum_state === "in_motion"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-indigo-500/10 text-indigo-300"
                        }`}
                      >
                        {goal.needs_user_progress
                          ? "Your move"
                          : goal.momentum_state.replace(/_/g, " ")}
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        {goal.next_action_title}
                      </p>
                    </div>
                    <p className="mb-4 max-w-2xl text-xs leading-relaxed text-zinc-500">
                      {goal.next_action_description}
                    </p>
                    {(goal.latest_progress_note ||
                      goal.latest_progress_value !== undefined) && (
                      <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          Latest shared move
                        </p>
                        <p className="mt-2 text-xs font-medium text-zinc-300">
                          {goal.latest_progress_by_user_id === user?.id
                            ? "You"
                            : "Your partner"}{" "}
                          moved this goal last
                          {goal.latest_progress_at
                            ? ` on ${new Date(goal.latest_progress_at).toLocaleDateString()}`
                            : ""}
                          .
                        </p>
                        {goal.latest_progress_note ? (
                          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                            {goal.latest_progress_note}
                          </p>
                        ) : null}
                        {goal.latest_progress_value !== undefined &&
                        goal.latest_progress_value !== null ? (
                          <span className="mt-3 inline-flex rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-400">
                            {Math.round(goal.latest_progress_value * 100)}%
                            confidence
                          </span>
                        ) : null}
                      </div>
                    )}
                    {goal.target_date && (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        Target:{" "}
                        {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      {goal.progress_updates} shared update
                      {goal.progress_updates !== 1 ? "s" : ""} recorded
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-3 sm:w-36 shrink-0">
                    <button
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="flex-1 sm:flex-none rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] transition hover:scale-[1.02]"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => router.push(`/goals/${goal.id}`)}
                      className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
                    >
                      {goal.needs_user_progress
                        ? "Respond to Goal"
                        : "View Details"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-700 delay-300">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Completed ({completedGoals.length})
            </p>
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.02] p-6 backdrop-blur-xl opacity-70 hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/goals/${goal.id}`)}
                    className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white hover:bg-white/10"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
