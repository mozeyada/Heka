'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen text-zinc-300 selection:bg-teal-500/30 font-sans">
      {/* Immersive Space Background */}
      <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] h-[50vh] w-[50vh] rounded-full bg-teal-900/20 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 pt-32 pb-24 lg:pt-40">
        <div className="app-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-medium tracking-tight text-white sm:text-6xl">
              Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">relationship.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              Clear, transparent pricing. Everything you need to resolve conflict and build understanding, without the anxiety.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-12 flex justify-center">
            <div className="relative flex rounded-full bg-white/5 p-1 backdrop-blur-md border border-white/10">
              <button
                type="button"
                className={`relative w-32 rounded-full py-2 text-sm font-medium transition ${
                  !isAnnual ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                {!isAnnual && (
                  <span className="absolute inset-0 rounded-full bg-white/10 shadow-lg" />
                )}
                <span className="relative z-10">Monthly</span>
              </button>
              <button
                type="button"
                className={`relative w-32 rounded-full py-2 text-sm font-medium transition ${
                  isAnnual ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                {isAnnual && (
                  <span className="absolute inset-0 rounded-full bg-white/10 shadow-lg" />
                )}
                <span className="relative z-10">Annually</span>
              </button>
              {/* Save tag */}
              <span className="absolute -top-3 -right-6 rounded-full bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-bold tracking-wide text-teal-300">
                SAVE 20%
              </span>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3">
            {/* Free Tier */}
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition hover:border-white/20 flex flex-col">
              <h3 className="text-xl font-semibold text-white">Free Trial</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">$0</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">Perfect for couples who want to try guided mediation.</p>
              
              <ul className="mt-10 space-y-4 text-sm text-zinc-300 flex-grow">
                {['3 AI Mediations per month', 'Basic Core Insights', 'Respectful Tone Checking', '30-Day History Access'].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <svg className="h-5 w-5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/register" className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                  Start Free
                </Link>
              </div>
            </div>

            {/* Starter Tier */}
            <div className="relative flex flex-col rounded-3xl border border-white/15 bg-white/[0.04] p-8 shadow-xl backdrop-blur-xl transition hover:border-white/25">
              <h3 className="text-xl font-semibold text-white">Starter</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">${isAnnual ? '3.33' : '4.99'}</span>
                <span className="text-sm font-medium text-zinc-500">/mo</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">Regular conflict resolution for navigating rough patches.</p>
              
              <ul className="mt-10 space-y-4 text-sm text-zinc-300 flex-grow">
                {[
                  '10 AI Mediations per month',
                  'Deeper Context Recognition',
                  'Shared Relationship Goals',
                  '6-Month History Archive'
                ].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <svg className="h-5 w-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/register" className="block w-full rounded-xl border border-indigo-500/40 bg-indigo-500/10 py-3 text-center text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:border-indigo-500/60">
                  Choose Starter
                </Link>
                {isAnnual && <p className="mt-3 text-center text-xs text-zinc-500">Billed $39.99 annually</p>}
              </div>
            </div>

            {/* Premium Tier */}
            <div className="relative flex flex-col rounded-3xl border border-teal-500/30 bg-teal-500/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-teal-400 to-indigo-400 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white">Premium</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">${isAnnual ? '6.66' : '9.99'}</span>
                <span className="text-sm font-medium text-zinc-500">/mo</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">Unlimited access to advanced frameworks and goal tracking.</p>
              
              <ul className="mt-10 space-y-4 text-sm text-zinc-300 flex-grow">
                {[
                  'Unlimited AI Mediations',
                  'Complete Conversation Archive',
                  'Priority AI Routing',
                  'Advanced Relationship Insights',
                  '24/7 Priority Support'
                ].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <svg className="h-5 w-5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/register" className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition hover:scale-[1.02]">
                  Join Premium
                </Link>
                {isAnnual && <p className="mt-3 text-center text-xs text-zinc-500">Billed $79.99 annually</p>}
              </div>
            </div>
          </div>

          {/* Privacy and Trust Architecture */}
          <div className="mx-auto mt-32 max-w-4xl text-center">
            <h2 className="text-3xl font-medium tracking-tight text-white">Privacy by Policy</h2>
            <p className="mt-4 text-zinc-400">
              Your relationship data is your most sensitive information. We treat it with the absolute highest level of security.
            </p>
            
            <div className="mt-12 grid gap-6 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-400/10 text-red-400 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-2">What we will never do</h4>
                <p className="text-sm text-zinc-400">
                  We will never sell your data to advertisers, let humans read your arguments, or use your data to train public AI models.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-teal-400/10 text-teal-400 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-2">Encrypted Transit</h4>
                <p className="text-sm text-zinc-400">
                  All communications to and from Heka, including requests to the mediation AI, are strongly encrypted in transit via TLS 1.3.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-400 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-2">Emergency Door</h4>
                <p className="text-sm text-zinc-400">
                  We maintain strict data boundaries. Our only exception is cooperating with legal orders if your life or safety is in imminent danger.
                </p>
              </div>
            </div>
            
            <div className="mt-10 px-8 py-4 rounded-xl bg-white/5 border border-white/10 inline-flex items-center gap-4 text-left">
              <svg className="h-8 w-8 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <div>
                <p className="text-sm text-zinc-300 font-medium">Safe AI Partnership</p>
                <p className="text-xs text-zinc-500 mt-1">Your arguments are sent temporarily to our AI provider strictly for immediate processing. They are contractually forbidden from saving it or using it to train their models.</p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
