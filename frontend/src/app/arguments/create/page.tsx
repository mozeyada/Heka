'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useArgumentsStore } from '@/store/argumentsStore';
import { useCouplesStore } from '@/store/couplesStore';
import { CrisisResources } from '@/components/CrisisResources';
import { Shield, ArrowLeft, ArrowRight, MessageCircle, Heart, DollarSign, Users, Home, Globe, Sparkles, Check } from 'lucide-react';

const CATEGORIES = [
  { value: 'communication', label: 'How we talk', icon: MessageCircle, color: 'text-teal-400', bg: 'bg-teal-500/10', ring: 'ring-teal-400/40' },
  { value: 'intimacy', label: 'Closeness & affection', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', ring: 'ring-rose-400/40' },
  { value: 'finances', label: 'Money & spending', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-400/40' },
  { value: 'family', label: 'Family & parenting', icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', ring: 'ring-green-400/40' },
  { value: 'lifestyle', label: 'Day-to-day life', icon: Home, color: 'text-cyan-400', bg: 'bg-cyan-500/10', ring: 'ring-cyan-400/40' },
  { value: 'values', label: 'Values & beliefs', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', ring: 'ring-indigo-400/40' },
  { value: 'future_plans', label: 'Our future', icon: Globe, color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-400/40' },
  { value: 'other', label: 'Something else', icon: MessageCircle, color: 'text-zinc-400', bg: 'bg-zinc-500/10', ring: 'ring-zinc-400/40' },
];

const URGENCY_OPTIONS = [
  { value: 'low', emoji: '🌱', label: 'Something small worth talking about', sub: 'No rush, but it matters' },
  { value: 'medium', emoji: '💭', label: "It's been on my mind a lot", sub: 'We should talk soon' },
  { value: 'high', emoji: '🔥', label: 'We really need to sort this out', sub: 'Affecting us daily' },
  { value: 'urgent', emoji: '🆘', label: 'I need help right now', sub: 'This feels urgent and painful' },
];

const MIN_WORDS = 15;

export default function CreateArgumentPage() {
  const router = useRouter();
  const { createArgument, isLoading, arguments: existingArguments } = useArgumentsStore();
  const { couple } = useCouplesStore();

  const [step, setStep] = useState(1);
  const [crisisAccepted, setCrisisAccepted] = useState(false);
  const [hasShownCrisisDisclaimer, setHasShownCrisisDisclaimer] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [perspective, setPerspective] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState<string | null>(null);

  const firstArgument = existingArguments.length === 0;
  const wordCount = perspective.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (!couple) router.push('/couples/create');
  }, [couple, router]);

  const handleSubmit = async () => {
    if (!title.trim() || !category || !perspective.trim()) {
      setError('Please complete all steps before continuing.');
      return;
    }
    if (wordCount < MIN_WORDS) {
      setError(`Share a bit more — at least ${MIN_WORDS} words helps Heka understand your side.`);
      return;
    }
    try {
      setError(null);
      const arg = await createArgument({ title, category, priority, initial_perspective: perspective });
      router.push(`/arguments/${arg.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "We couldn't save your conversation right now. Your words are still here — tap to try again.");
    }
  };

  const totalSteps = firstArgument ? 4 : 3;
  const STEP_SAFETY = firstArgument ? 1 : null;
  const STEP_CATEGORY = firstArgument ? 2 : 1;
  const STEP_STORY = firstArgument ? 3 : 2;
  const STEP_URGENCY = firstArgument ? 4 : 3;

  return (
    <div className="min-h-screen text-zinc-300 pb-32 relative">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[50vh] w-[80vw] rounded-full bg-teal-900/10 blur-[140px]" />
      </div>

      <div className="app-container max-w-2xl py-10">

        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-white mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">Start a conversation</p>
          <h1 className="text-2xl font-semibold text-white">Let's work through this together</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Share what's on your mind. Heka will make sure both sides are heard.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s < step ? 'bg-teal-400' : s === step ? 'bg-teal-400/60' : 'bg-white/10'
            }`} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* ── STEP: Safety (first argument only) ── */}
        {firstArgument && step === 1 && !crisisAccepted && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.05] p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-semibold text-white">Before we begin</h2>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-2">
                Heka is a space for navigating everyday relationship friction. For your first conversation,
                we want to make sure you know about crisis support resources.
              </p>
              <p className="text-xs text-zinc-500 mb-6">
                If you or your partner are in immediate distress, please reach out to a professional.
              </p>
              <button type="button" onClick={() => setHasShownCrisisDisclaimer(true)}
                className="btn-primary text-sm">
                Show me the resources
              </button>
            </div>
          </div>
        )}

        {firstArgument && step === 1 && hasShownCrisisDisclaimer && !crisisAccepted && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.05] p-8 animate-in fade-in zoom-in-95 duration-300">
            <CrisisResources onAccept={() => { setCrisisAccepted(true); setStep(2); }} showAcceptButton />
          </div>
        )}

        {/* ── STEP: Category ── */}
        {step === STEP_CATEGORY && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="text-base font-semibold text-white block mb-1">
                What area of your relationship is this about?
              </label>
              <p className="text-sm text-zinc-400 mb-6">Pick the one that fits best — you can always add context later.</p>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button key={cat.value} type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? `border-white/20 bg-white/[0.08] ring-1 ${cat.ring}`
                          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]'
                      }`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cat.bg} ${cat.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{cat.label}</p>
                      </div>
                      {isSelected && <Check className="ml-auto h-3.5 w-3.5 text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Also collect the topic/title here */}
            <div>
              <label className="text-sm font-semibold text-white block mb-2">
                Give it a short name <span className="text-zinc-500 font-normal">(optional but helpful)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How we spend weekends together"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition"
              />
            </div>

            <button type="button"
              onClick={() => {
                if (!category) { setError('Pick a topic area to continue.'); return; }
                if (!title.trim()) { setTitle(CATEGORIES.find(c => c.value === category)?.label || category); }
                setError(null);
                setStep(STEP_STORY!);
              }}
              className="btn-primary w-full flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── STEP: Your Story ── */}
        {step === STEP_STORY && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="text-base font-semibold text-white block mb-1">
                Take your time. What happened from your side?
              </label>
              <p className="text-sm text-zinc-400 mb-4">
                Write as if you're talking to a calm, trusted friend. What did you feel? What do you need your partner to understand?
              </p>

              <textarea
                value={perspective}
                onChange={(e) => setPerspective(e.target.value)}
                rows={8}
                autoFocus
                placeholder="I felt... When... What really hurt was... What I need is..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition resize-none leading-relaxed"
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  {wordCount < MIN_WORDS
                    ? `${MIN_WORDS - wordCount} more words and you're good to continue`
                    : <span className="text-teal-400">✓ That's enough to work with</span>}
                </p>
                <p className="text-xs text-zinc-600">{wordCount} words</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(STEP_CATEGORY!)}
                className="btn-secondary flex items-center gap-2 text-sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button"
                onClick={() => {
                  if (wordCount < MIN_WORDS) {
                    setError(`Share a bit more — at least ${MIN_WORDS} words helps Heka understand your side.`);
                    return;
                  }
                  setError(null);
                  setStep(STEP_URGENCY!);
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Urgency ── */}
        {step === STEP_URGENCY && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="text-base font-semibold text-white block mb-1">
                How much is this affecting you right now?
              </label>
              <p className="text-sm text-zinc-400 mb-6">
                This helps Heka understand how to prioritise this conversation.
              </p>

              <div className="space-y-3">
                {URGENCY_OPTIONS.map((opt) => {
                  const isSelected = priority === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => setPriority(opt.value)}
                      className={`w-full flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                        isSelected
                          ? 'border-teal-400/40 bg-teal-500/10 ring-1 ring-teal-400/20'
                          : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]'
                      }`}>
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{opt.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{opt.sub}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(STEP_STORY!)}
                className="btn-secondary flex items-center gap-2 text-sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button" onClick={handleSubmit} disabled={isLoading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving your thoughts…
                  </span>
                ) : (
                  <>I've said what I needed to say →</>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-600">
              Your partner will be notified privately that you'd like to work through something together.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
