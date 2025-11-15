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

const formatCategory = (value: string) =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

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
      <div className="app-container py-8 max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Create a New Argument</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Capture both sides of the disagreement so Heka can deliver insights tailored to your relationship.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* First Argument Safety Notice */}
        {firstArgument && !hasShownCrisisDisclaimer && (
          <div className="section-shell bg-yellow-50 border-yellow-200 p-6">
            <h2 className="text-base font-semibold text-neutral-900">Safety first</h2>
            <p className="mt-2 text-sm text-neutral-700">
              Before your first argument, we'll share guidance on crisis resources and situations that need professional help.
            </p>
            <p className="mt-4 text-sm text-neutral-600">
              Click "Continue" to review the safety notice, or "Cancel" if you'd like to return later.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setHasShownCrisisDisclaimer(true)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Continue
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}

        {/* Crisis Resources */}
        {hasShownCrisisDisclaimer && !crisisAccepted && (
          <div className="section-shell bg-yellow-50 border-yellow-200 p-6">
            <CrisisResources
              onAccept={() => setCrisisAccepted(true)}
              showAcceptButton
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`section-shell p-5 ${
            error.toLowerCase().includes('limit')
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900">{error}</p>
              {error.toLowerCase().includes('limit') && (
                <Link
                  href="/subscription"
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="section-shell p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
                  Argument Title
                </label>
                <input
                  id="title"
                  {...register('title')}
                  type="text"
                  placeholder="e.g., How we spend Saturday mornings"
                  className="input-field mt-2"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
                    Category
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="input-field mt-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategory(cat)}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-neutral-700">
                    Priority
                  </label>
                  <select
                    id="priority"
                    {...register('priority')}
                    className="input-field mt-2"
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
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating…' : 'Create Argument'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
