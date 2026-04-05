'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
        }, 2500);
      } catch (error) {
        console.error('Failed to refresh subscription:', error);
      }
    };

    if (sessionId) {
      refreshSubscription();
    }
  }, [sessionId, isAuthenticated, router]);

  return (
    <div className="min-h-screen pb-20 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-emerald-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[22%] h-[46vh] w-[46vh] rounded-full bg-teal-900/18 blur-[155px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[34vh] w-[34vh] rounded-full bg-indigo-900/12 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="app-container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-xl">
          <div className="section-shell border border-emerald-500/20 bg-emerald-500/[0.06] p-8 text-center md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
              <Sparkles className="h-3.5 w-3.5" />
              Billing Activated
            </div>

            <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">Payment successful</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Your subscription has been activated. Heka is refreshing your billing state now and will return you to the subscription screen automatically.
            </p>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-black/25 p-5 text-left">
              <p className="text-sm text-zinc-400">
                If the redirect takes longer than expected, you can move manually and confirm the updated plan on your subscription page.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/subscription" className="btn-primary inline-flex flex-1 items-center justify-center gap-2">
                View Subscription
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-secondary inline-flex flex-1 items-center justify-center gap-2">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
