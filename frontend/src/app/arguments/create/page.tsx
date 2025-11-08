'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArgumentsStore } from '@/store/argumentsStore';
import { useCouplesStore } from '@/store/couplesStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CrisisResources } from '@/components/CrisisResources';

const argumentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  category: z.string(),
  priority: z.string().default('medium'),
});

type ArgumentFormData = z.infer<typeof argumentSchema>;

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

export default function CreateArgumentPage() {
  const router = useRouter();
  const { createArgument, isLoading } = useArgumentsStore();
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
    // Check if this is user's first argument and show crisis disclaimer
    if (!hasShownCrisisDisclaimer) {
      setHasShownCrisisDisclaimer(true);
      return; // Don't submit yet, show disclaimer first
    }
    
    if (!crisisAccepted) {
      setError('Please acknowledge the safety notice before creating an argument');
      return;
    }
    
    try {
      setError(null);
      await createArgument(data);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create argument';
      setError(errorMessage);
      
      // If it's a usage limit error, suggest upgrading
      if (err.response?.status === 403 && errorMessage.includes('limit')) {
        // Error message already contains upgrade suggestion
      }
    }
  };

  if (!couple) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Heka</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Create New Argument</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Describe the disagreement or issue you'd like to resolve together.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Crisis Resources Disclaimer - Show on first argument */}
            {hasShownCrisisDisclaimer && !crisisAccepted && (
              <CrisisResources
                onAccept={() => setCrisisAccepted(true)}
                showAcceptButton={true}
              />
            )}
            
            {!hasShownCrisisDisclaimer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Before creating your first argument:</strong> You'll see important safety information 
                  about when to seek professional help.
                </p>
              </div>
            )}
            
            {error && (
              <div className={`border rounded-lg px-4 py-3 ${
                error.includes('limit') || error.includes('Upgrade')
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {error}
                  </div>
                  {(error.includes('limit') || error.includes('Upgrade')) && (
                    <button
                      type="button"
                      onClick={() => router.push('/subscription')}
                      className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm whitespace-nowrap"
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g., Weekly date night"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                {...register('category')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                {...register('priority')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={isLoading || (hasShownCrisisDisclaimer && !crisisAccepted)}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? 'Creating...' : 'Create Argument'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

