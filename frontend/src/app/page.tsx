'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [checkAuth, isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-neutral-25">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 pb-20 pt-24">
        <div className="app-container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              Turn conflict into{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                connection
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-600 sm:text-lg">
              AI-powered mediation that helps couples resolve disagreements with empathy, clarity, and actionable guidance.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-full border-2 border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              7-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
        
        {/* Visual Accent */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[600px] opacity-30">
          <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300 to-pink-300 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="app-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              How Heka helps couples communicate better
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              A neutral third perspective that understands both sides and guides you toward resolution.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                🤖
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900">AI Mediation</h3>
              <p className="mt-3 text-sm text-neutral-600">
                Get neutral, unbiased analysis of both perspectives with AI-powered insights that bridge understanding.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-2xl">
                💬
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900">Dual Perspective</h3>
              <p className="mt-3 text-sm text-neutral-600">
                Both partners share their side in a safe space. Heka highlights common ground and helps you move forward.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                📊
              </div>
              <h3 className="mt-6 text-lg font-semibold text-neutral-900">Track Progress</h3>
              <p className="mt-3 text-sm text-neutral-600">
                Set relationship goals, complete weekly check-ins, and see your communication improve over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-pink-600 py-20">
        <div className="app-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to build a stronger relationship?
            </h2>
            <p className="mt-4 text-base text-indigo-100">
              Join couples who use Heka to navigate conflict with empathy and clarity.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
