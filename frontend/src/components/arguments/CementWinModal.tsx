import { useCallback, useEffect, useState } from 'react';
import { aiSuggestionsAPI, goalsAPI } from '@/lib/api';

interface GoalSuggestion {
    title: string;
    description: string;
}

interface CheckinSuggestion {
    question: string;
    category?: string;
}

interface CementWinModalProps {
    isOpen: boolean;
    onClose: () => void;
    argumentId: string;
}

export function CementWinModal({ isOpen, onClose, argumentId }: CementWinModalProps) {
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<GoalSuggestion[]>([]);
    const [checkins, setCheckins] = useState<CheckinSuggestion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

    const loadSuggestions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [goalsRes, checkinsRes] = await Promise.all([
                aiSuggestionsAPI.generateArgumentGoals(argumentId),
                aiSuggestionsAPI.generateArgumentCheckins(argumentId),
            ]);
            setGoals(goalsRes.suggestions);
            setCheckins(checkinsRes.suggestions);
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'The AI service is temporarily unavailable. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [argumentId]);

    useEffect(() => {
        if (isOpen && argumentId) {
            loadSuggestions();
            // Reset saved state when modal opens for a new argument
            setSavedIndexes(new Set());
        }
    }, [argumentId, isOpen, loadSuggestions]);

    const handleSaveGoal = async (goal: GoalSuggestion, index: number) => {
        setSavingIndex(index);
        try {
            const targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() + 1);

            await goalsAPI.create({
                title: goal.title,
                description: goal.description,
                target_date: targetDate.toISOString(),
                first_step: 'I am opening this goal now so we can decide the first concrete move together.',
            });
            // Mark this specific goal as successfully saved
            setSavedIndexes(prev => new Set(prev).add(index));
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save goal. Please try again.');
        } finally {
            setSavingIndex(null);
        }
    };

    const getCheckinTimingLabel = (index: number) => {
        if (index === 0) return 'Use next week';
        if (index === 1) return 'Use the week after';
        return 'Keep in reserve';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative rounded-[2rem] border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/[0.06] flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">🌱 Cement the Win</h2>
                        <p className="text-sm text-zinc-400 mt-1">Turn this resolution into lasting growth.</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors ml-4 shrink-0" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-14 text-zinc-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-4"></div>
                            <p className="text-sm">Generating personalised steps…</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6">
                            <div className="text-3xl mb-3">⚠️</div>
                            <h3 className="text-sm font-semibold text-red-300 mb-2">Could not generate action items</h3>
                            <p className="text-red-400/80 text-xs mb-6">{error}</p>
                            <button
                                onClick={loadSuggestions}
                                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Goals Section */}
                            {goals.length > 0 ? (
                                <section>
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Suggested Shared Goals</h3>
                                    <div className="space-y-4">
                                        {goals.map((goal, index) => {
                                            const isSaving = savingIndex === index;
                                            const isSaved = savedIndexes.has(index);

                                            return (
                                                <div key={index} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                                                    <h4 className="font-semibold text-white text-sm mb-1">{goal.title}</h4>
                                                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{goal.description}</p>
                                                    <button
                                                        onClick={() => handleSaveGoal(goal, index)}
                                                        disabled={isSaving || isSaved}
                                                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center min-w-[110px] ${
                                                            isSaved
                                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                                                                : 'bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50'
                                                        }`}
                                                    >
                                                        {isSaving ? 'Saving…' : isSaved ? '✓ Saved' : 'Save Goal'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : (
                                <div className="text-center py-8 text-zinc-500 text-sm italic">
                                    No specific goals suggested from this argument.
                                </div>
                            )}

                            {/* Check-in Section */}
                            {checkins.length > 0 && (
                                <section>
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Weekly Check-in Rituals</h3>
                                    <div className="space-y-3">
                                        {checkins.slice(0, 3).map((checkin, index) => (
                                            <div key={`${checkin.question}-${index}`} className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-lg mt-0.5">💬</span>
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className="inline-flex rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                                                {getCheckinTimingLabel(index)}
                                                            </span>
                                                            {checkin.category ? (
                                                                <span className="inline-flex rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                                    {checkin.category}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <p className="text-sm text-zinc-200 italic leading-relaxed">"{checkin.question}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 text-sm font-semibold hover:bg-white/[0.07] transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
