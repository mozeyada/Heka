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
        } catch (error: any) {
            console.error('Failed to load suggestions:', error);
            const msg = error.response?.data?.detail || 'The AI service is temporarily unavailable. Please try again.';
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
        } catch (error: any) {
            console.error('Failed to save goal:', error);
            alert(error.response?.data?.detail || 'Failed to save goal.');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">🌱 Cement the Win</h2>
                        <p className="text-gray-500 mt-1">Turn this resolution into lasting growth.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                            <p>Generating personalized steps...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-red-50 rounded-xl p-6 border border-red-100">
                            <div className="text-red-500 text-4xl mb-3">⚠️</div>
                            <h3 className="text-lg font-medium text-red-900 mb-2">Could not generate action items</h3>
                            <p className="text-red-600 text-sm mb-6">{error}</p>
                            <button
                                onClick={loadSuggestions}
                                className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Goals Section */}
                            {goals.length > 0 ? (
                                <section>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Suggested Shared Goals</h3>
                                    <div className="space-y-4">
                                        {goals.map((goal, index) => {
                                            const isSaving = savingIndex === index;
                                            const isSaved = savedIndexes.has(index);

                                            return (
                                                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                                                    <button
                                                        onClick={() => handleSaveGoal(goal, index)}
                                                        disabled={isSaving || isSaved}
                                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center min-w-[120px] ${
                                                            isSaved 
                                                                ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed' 
                                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                                                        }`}
                                                    >
                                                        {isSaving ? 'Saving...' : isSaved ? '✓ Saved' : 'Save Goal'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic">
                                    No specific goals suggested from this argument.
                                </div>
                            )}

                            {/* Check-in Section */}
                            {checkins.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Weekly Check-in Rituals</h3>
                                    <div className="space-y-3">
                                        {checkins.slice(0, 3).map((checkin, index) => (
                                            <div key={`${checkin.question}-${index}`} className="rounded-xl border border-indigo-100 bg-indigo-50/90 p-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xl">💬</span>
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                                                                {getCheckinTimingLabel(index)}
                                                            </span>
                                                            {checkin.category ? (
                                                                <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                                                                    {checkin.category}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <p className="mt-3 text-sm font-medium italic text-indigo-950">"{checkin.question}"</p>
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
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
