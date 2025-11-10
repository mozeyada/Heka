'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { subscriptionsAPI } from '@/lib/api';

function SubscriptionSuccessContent() {
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

    const refreshSubscription = async () => {
      try {
        await subscriptionsAPI.getMySubscription();
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md">
        <div className="section-shell border border-green-200 bg-green-50/60 p-10 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
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
          <h1 className="text-2xl font-bold text-neutral-900">Payment Successful!</h1>
          <p className="mt-3 text-sm text-neutral-600">
            Your subscription has been activated. You now have full access to all features.
          </p>
          <p className="mt-6 text-xs text-neutral-500">Redirecting to subscription page…</p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-25">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
