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

const argumentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().default('medium'),
});

const categories = [
  'finances',
  'communication',
  'values',
  'intimacy',
  'family',
  'lifestyle',
  'future_plans',
  'other',
];

const priorities = ['low', 'medium', 'high', 'urgent'];

type ArgumentFormData = z.infer<typeof argumentSchema>;

export default function CreateArgumentPage() {
  const router = useRouter();
  const { createArgument, isLoading, arguments: existingArguments } = useArgumentsStore();
  const { couple } = useCouplesStore();
  const [error, setError] = useState<string | null>(null);
  const [crisisAccepted, setCrisisAccepted] = useState(false);
  const [hasShownCrisisDisclaimer, setHasShownCrisisDisclaimer] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArgumentFormData>({
    resolver: zodResolver(argumentSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (!couple) {
      router.push('/couples/create');
    }
  }, [couple, router]);

  const onSubmit = async (data: ArgumentFormData) => {
    if (!hasShownCrisisDisclaimer) {
      setHasShownCrisisDisclaimer(true);
      return;
    }

    if (!crisisAccepted) {
      setError('Please acknowledge the safety notice before creating an argument.');
      return;
    }

    try {
      setError(null);
      await createArgument(data);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create argument';
      setError(errorMessage);
    }
  };

  if (!couple) {
    return null;
  }

  const formatCategory = (value: string) =>
    value
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');

  const firstArgument = existingArguments.length === 0;

  return (
    <div className="relative overflow-hidden bg-neutral-25 pb-24 pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-indigo-100/60 via-white/40 to-transparent" />
        <div className="absolute left-[-12%] top-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute right-[-18%] top-20 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
      </div>

      <div className="app-container relative max-w-4xl space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_rgba(79,70,229,0.15)] backdrop-blur">
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-400/20 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">New argument intake</p>
              <h1 className="mt-3 text-3xl font-semibold text-neutral-900 sm:text-4xl">
                Hold space for what needs to be heard.
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Heka guides both of you through conflict with calm structure. Capture the tension in your own words so AI
                can reflect it back with empathy, context, and next steps that actually feel doable.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 px-4 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-800"
            >
              Back
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Step 1</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">Make it safe</p>
              <p className="mt-1 text-xs text-neutral-500">Acknowledge crisis resources when things feel escalated.</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Step 2</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">Name the conflict</p>
              <p className="mt-1 text-xs text-neutral-500">Describe the pattern or flashpoint in clear, neutral language.</p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Step 3</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">Let Heka mediate</p>
              <p className="mt-1 text-xs text-neutral-500">Get insights, scripts, and next steps rooted in both voices.</p>
            </div>
          </div>
        </section>

        {firstArgument && !hasShownCrisisDisclaimer && (
          <div className="relative overflow-hidden rounded-[28px] border border-warning-200/80 bg-gradient-to-br from-amber-100/70 via-white to-rose-100/60 p-6 shadow-[0_24px_60px_rgba(217,119,6,0.18)]">
            <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/40 blur-xl" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-warning-700">Safety first.</h2>
              <p className="mt-2 text-sm text-warning-600">
                Before your first argument, we pause to make sure you know when a human professional is the right call.
              </p>
              <p className="mt-4 text-sm text-neutral-600">
                If either of you feels unsafe, overwhelmed, or in crisis, contact emergency services or a trusted support
                person immediately. Heka is designed for communication—not emergencies.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setHasShownCrisisDisclaimer(true)}
                  className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  Continue
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-2 text-sm font-semibold text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  Maybe later
                </Link>
              </div>
            </div>
          </div>
        )}

        {hasShownCrisisDisclaimer && !crisisAccepted && (
          <div className="rounded-[28px] border border-warning-200 bg-warning-50/70 p-6 shadow-[0_20px_45px_rgba(217,119,6,0.15)]">
            <CrisisResources onAccept={() => setCrisisAccepted(true)} showAcceptButton />
          </div>
        )}

        {error && (
          <div
            className={classNames(
              'rounded-[28px] border p-5 shadow-[0_20px_45px_rgba(220,38,38,0.12)]',
              error.toLowerCase().includes('limit')
                ? 'border-warning-200 bg-warning-50/70'
                : 'border-danger-200 bg-danger-50/80'
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-700">{error}</p>
              {error.toLowerCase().includes('limit') && (
                <Link
                  href="/subscription"
                  className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:-translate-y-0.5"
                >
                  Upgrade plan
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <header className="flex flex-col gap-2 border-b border-neutral-100 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Conflict summary</p>
              <h2 className="text-xl font-semibold text-neutral-900">Give the tension a clear headline</h2>
              <p className="text-sm text-neutral-500">
                What’s the story in one sentence? Name the pattern, not the person.
              </p>
            </header>

            <div className="mt-6 space-y-2">
              <label htmlFor="title" className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Argument title
              </label>
              <input
                id="title"
                {...register('title')}
                type="text"
                placeholder="e.g., Saturday mornings feel like logistics instead of connection"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-[0_0_0_1px_rgba(15,23,42,0.03)] transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200/40"
              />
              {errors.title && (
                <p className="text-xs font-semibold text-danger-600">{errors.title.message}</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur">
            <header className="flex flex-col gap-2 border-b border-neutral-100 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Context</p>
              <h2 className="text-xl font-semibold text-neutral-900">Help Heka understand the dynamics</h2>
              <p className="text-sm text-neutral-500">
                Choose the category that best fits and how urgent it feels in your relationship.
              </p>
            </header>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400"
                >
                  Category
                </label>
                <select
                  id="category"
                  {...register('category')}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-[0_0_0_1px_rgba(15,23,42,0.03)] transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200/40"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs font-semibold text-danger-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="priority"
                  className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-[0_0_0_1px_rgba(15,23,42,0.03)] transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200/40"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 text-xs text-neutral-500">
              <p>
                Not sure which category fits? Pick the closest match and we’ll adapt the guidance. You can always refine
                it once both perspectives are logged.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || (hasShownCrisisDisclaimer && !crisisAccepted)}
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            >
              {isLoading ? 'Creating…' : 'Create argument'}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-8 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

