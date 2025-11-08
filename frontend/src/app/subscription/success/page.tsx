'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { subscriptionsAPI } from '@/lib/api';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Refresh subscription data after successful payment
    const refreshSubscription = async () => {
      try {
        await subscriptionsAPI.getMySubscription();
        // Redirect to subscription page after a delay
        setTimeout(() => {
          router.push('/subscription');
        }, 3000);
      } catch (error) {
        console.error('Failed to refresh subscription:', error);
      }
    };

    if (sessionId) {
      refreshSubscription();
    }
  }, [sessionId, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your subscription has been activated. You now have full access to all features.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to subscription page...
        </p>
      </div>
    </div>
  );
}

