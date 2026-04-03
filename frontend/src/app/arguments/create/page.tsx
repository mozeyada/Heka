'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useArgumentsStore } from '@/store/argumentsStore';
import { useCouplesStore } from '@/store/couplesStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CrisisResources } from '@/components/CrisisResources';
import { ChevronLeft, AlertTriangle, Shield } from 'lucide-react';

const argumentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().default('medium'),
  initial_perspective: z.string().min(10, 'Share enough context for your partner and the AI to understand your side').max(5000),
});

const categories = ['finances', 'communication', 'values', 'intimacy', 'family', 'lifestyle', 'future_plans', 'other'];
const priorities = ['low', 'medium', 'high', 'urgent'];
type ArgumentFormData = z.infer<typeof argumentSchema>;
const formatCategory = (v: string) => v.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

const priorityDescriptions: Record<string, string> = {
  low: 'Minor friction that can wait',
  medium: 'Needs attention this week',
  high: 'Actively affecting your relationship',
  urgent: 'Needs immediate mediation',
};

export default function CreateArgumentPage() {
  const router = useRouter();
  const { createArgument, isLoading, arguments: existingArguments } = useArgumentsStore();
  const { couple } = useCouplesStore();
  const [error, setError] = useState<string | null>(null);
  const [crisisAccepted, setCrisisAccepted] = useState(false);
  const [hasShownCrisisDisclaimer, setHasShownCrisisDisclaimer] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('medium');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ArgumentFormData>({
    resolver: zodResolver(argumentSchema),
    defaultValues: { priority: 'medium' },
  });

  useEffect(() => {
    if (!couple) router.push('/couples/create');
  }, [couple, router]);

  const onSubmit = async (data: ArgumentFormData) => {
    if (!hasShownCrisisDisclaimer) { setHasShownCrisisDisclaimer(true); return; }
    if (!crisisAccepted) { setError('Please acknowledge the safety notice before continuing.'); return; }
    try {
      setError(null);
      const argument = await createArgument(data);
      router.push(`/arguments/${argument.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create argument');
    }
  };

  if (!couple) return null;
  const firstArgument = existingArguments.length === 0;

  return (
    <div className="min-h-screen text-zinc-300 pb-32 font-sans">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] h-[40vh] w-[40vh] rounded-full bg-teal-900/15 blur-[130px]" />
        <div className="absolute bottom-[20%] left-[5%] h-[45vh] w-[45vh] rounded-full bg-indigo-900/15 blur-[140px]" />
      </div>

      <div className="app-container max-w-2xl py-10 space-y-8 pb-28">

        {/* Back nav */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition animate-in fade-in duration-500">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">AI Mediation</p>
          <h1 className="text-3xl font-medium tracking-tight text-white">Log New Conflict</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg">
            Capture the conflict and your side in one pass so your partner can respond immediately and the AI can move as soon as both perspectives are in.
          </p>
        </div>

        {/* First-time Safety Gate */}
        {firstArgument && !hasShownCrisisDisclaimer && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Safe Space First</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
              Before your first session, we'll share guidance on crisis situations and when to seek professional help.
            </p>
            <p className="text-xs text-zinc-500 mb-6">
              Click "Continue to Safety Notice" to review, or go back to the dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setHasShownCrisisDisclaimer(true)}
                className="rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition hover:scale-[1.02]">
                Continue to Safety Notice
              </button>
              <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10">
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Crisis Resources */}
        {hasShownCrisisDisclaimer && !crisisAccepted && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
            <CrisisResources onAccept={() => setCrisisAccepted(true)} showAcceptButton />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300">{error}</p>
              {error.toLowerCase().includes('limit') && (
                <Link href="/subscription" className="mt-2 inline-block rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-black transition hover:scale-[1.02]">
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Main Form */}
        {(crisisAccepted || !firstArgument) && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-2xl space-y-6">

              <div>
                <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">What's the conflict about?</label>
                <input id="title" {...register('title')} type="text"
                  placeholder="e.g., How we spend Saturday mornings"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition"
                />
                {errors.title && <p className="mt-2 text-xs font-semibold text-red-400">{errors.title.message}</p>}
              </div>

              <div>
                <label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                <select id="category" {...register('category')}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition [color-scheme:dark]">
                  <option value="">Select a category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{formatCategory(cat)}</option>)}
                </select>
                {errors.category && <p className="mt-2 text-xs font-semibold text-red-400">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="initial_perspective" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Your perspective</label>
                <textarea
                  id="initial_perspective"
                  {...register('initial_perspective')}
                  rows={7}
                  placeholder="Describe what happened from your side, how it felt, what mattered to you, and what you need your partner to understand."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition resize-none"
                />
                {errors.initial_perspective && <p className="mt-2 text-xs font-semibold text-red-400">{errors.initial_perspective.message}</p>}
                <p className="mt-3 text-xs text-zinc-500">
                  This becomes the first context entry. Your partner will immediately see that this conflict needs their response.
                </p>
              </div>

              {/* Priority Visual Picker */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">How urgent is this?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {priorities.map(p => {
                    const isSelected = selectedPriority === p;
                    const colors: Record<string, string> = {
                      low: 'border-zinc-700 bg-zinc-800/50 text-zinc-400',
                      medium: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                      high: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
                      urgent: 'border-red-500/30 bg-red-500/10 text-red-400',
                    };
                    const selectedColors: Record<string, string> = {
                      low: 'border-zinc-400 bg-zinc-700 text-white',
                      medium: 'border-blue-500 bg-blue-500/20 text-white',
                      high: 'border-orange-500 bg-orange-500/20 text-white',
                      urgent: 'border-red-500 bg-red-500/20 text-white',
                    };
                    return (
                      <button key={p} type="button"
                        onClick={() => { setSelectedPriority(p); setValue('priority', p); }}
                        className={`rounded-xl border p-3 text-left transition-all ${isSelected ? selectedColors[p] : colors[p] + ' hover:opacity-80'}`}>
                        <p className="text-xs font-bold capitalize mb-1">{p}</p>
                        <p className="text-[10px] leading-relaxed opacity-70">{priorityDescriptions[p]}</p>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" {...register('priority')} value={selectedPriority} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={isLoading || (hasShownCrisisDisclaimer && !crisisAccepted)}
                className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {isLoading ? 'Creating…' : 'Create Conflict and Add My Side'}
              </button>
              <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
