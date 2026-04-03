'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CreditCard, LifeBuoy, XCircle } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const error = searchParams?.get('error') || 'Your payment could not be processed.';

  return (
    <div className="min-h-screen pb-20 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-red-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[22%] h-[46vh] w-[46vh] rounded-full bg-orange-900/18 blur-[155px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[34vh] w-[34vh] rounded-full bg-rose-900/12 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="app-container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-xl">
          <div className="section-shell border border-red-500/20 bg-red-500/[0.06] p-8 text-center md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10 text-red-300">
              <XCircle className="h-8 w-8" />
            </div>

            <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">Payment failed</h1>

            <div className="mx-auto mt-6 max-w-lg rounded-[1.6rem] border border-red-500/20 bg-black/25 p-5 text-left">
              <p className="text-sm font-semibold text-red-200">{error}</p>
              <p className="mt-3 text-sm text-zinc-400">
                Common reasons are a declined card, insufficient funds, or an expired payment method. Your existing account remains intact.
              </p>
            </div>

            {sessionId && (
              <p className="mt-4 text-xs text-zinc-500">Session ID: {sessionId}</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/subscription" className="btn-primary inline-flex flex-1 items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                Try Again
              </Link>
              <Link href="/dashboard" className="btn-secondary inline-flex flex-1 items-center justify-center gap-2">
                Back to Dashboard
              </Link>
            </div>

            <p className="mt-6 border-t border-white/10 pt-6 text-sm text-zinc-400">
              Need help?{' '}
              <a href="mailto:hello@heka.app" className="inline-flex items-center gap-1 font-semibold text-teal-300 hover:text-teal-200">
                <LifeBuoy className="h-4 w-4" />
                hello@heka.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
