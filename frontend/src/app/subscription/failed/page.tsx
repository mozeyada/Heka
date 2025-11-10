'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const error = searchParams?.get('error') || 'Your payment could not be processed.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <div className="section-shell border border-red-200 bg-red-50/60 p-10 text-center">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Payment Failed</h1>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-red-300 bg-white/80 p-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <p className="mt-2 text-xs text-red-600">
              Common reasons: card declined, insufficient funds, or expired card.
            </p>
          </div>

          {sessionId && (
            <p className="mt-4 text-xs text-neutral-400">Session ID: {sessionId}</p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/subscription"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>

          <p className="mt-6 border-t border-red-200 pt-6 text-xs text-neutral-500">
            Need help? Contact <a href="mailto:hello@heka.app" className="font-semibold text-indigo-600">hello@heka.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-25">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}


