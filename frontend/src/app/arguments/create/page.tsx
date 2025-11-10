'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useArgumentsStore } from '@/store/argumentsStore';
import { useCouplesStore } from '@/store/couplesStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeading } from '@/components/PageHeading';
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

  const firstArgument = existingArguments.length === 0;

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Create a New Argument"
        description="Capture both sides of the disagreement so Heka can deliver insights tailored to your relationship."
        actions={
          <Link
            href="/dashboard"
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
          >
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {firstArgument && !hasShownCrisisDisclaimer && (
            <div className="section-shell border border-warning-200 bg-warning-50/80 p-6">
              <h2 className="text-lg font-semibold text-warning-600">Safety first</h2>
              <p className="mt-2 text-sm text-warning-600">
                Before your first argument, we’ll share guidance on crisis resources and situations that need professional help.
              </p>
              <p className="mt-4 text-sm text-neutral-500">
                Click “Continue” to review the safety notice, or “Cancel” if you’d like to return later.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setHasShownCrisisDisclaimer(true)}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
                >
                  Continue
                </button>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
                >
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {hasShownCrisisDisclaimer && !crisisAccepted && (
            <div className="section-shell border border-warning-200 bg-warning-50/80 p-6">
              <CrisisResources
                onAccept={() => setCrisisAccepted(true)}
                showAcceptButton
              />
            </div>
          )}

          {error && (
            <div
              className={`section-shell p-5 ${
                error.toLowerCase().includes('limit')
                  ? 'border border-warning-200 bg-warning-50/80'
                  : 'border border-danger-200 bg-danger-50/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-700">{error}</p>
                {error.toLowerCase().includes('limit') && (
                  <Link
                    href="/subscription"
                    className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
                  >
                    Upgrade Plan
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="section-shell p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Argument title
                </label>
                <input
                  id="title"
                  {...register('title')}
                  type="text"
                  placeholder="e.g., How we spend Saturday mornings"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                {errors.title && (
                  <p className="mt-2 text-xs font-semibold text-danger-600">{errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    Category
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat
                          .split('_')
                          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                          .join(' ')}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-xs font-semibold text-danger-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    Priority
                  </label>
                  <select
                    id="priority"
                    {...register('priority')}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading || (hasShownCrisisDisclaimer && !crisisAccepted)}
              className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {isLoading ? 'Creating…' : 'Create Argument'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:border-neutral-300 hover:text-neutral-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

