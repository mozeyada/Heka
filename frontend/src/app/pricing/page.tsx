'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen text-zinc-300 selection:bg-teal-500/30 font-sans">
      {/* Immersive Space Background */}
      <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] h-[50vh] w-[50vh] rounded-full bg-teal-900/20 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 pt-40 pb-24 lg:pt-48">
        <div className="app-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-medium tracking-tight text-white sm:text-6xl">
              Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">relationship.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              Clear, transparent pricing. Everything you need to resolve conflict and build understanding, without the anxiety.
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Free Tier */}
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl transition hover:border-white/20">
              <h3 className="text-xl font-semibold text-white">Basic Resolution</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">Free</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">Perfect for couples who want to try guided mediation.</p>
              
              <ul className="mt-10 space-y-4 text-sm text-zinc-300">
                {['1 AI Mediation Session per week', 'Basic Core Insights', 'Respectful Tone Checking', '7-Day History Access'].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <svg className="h-5 w-5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Premium Tier */}
            <div className="relative rounded-3xl border border-teal-500/30 bg-teal-500/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-teal-400 to-indigo-400 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white">Heka Premium</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-white">$15</span>
                <span className="text-sm font-medium text-zinc-500">/month per couple</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">Unlimited access to advanced frameworks and goal tracking.</p>
              
              <ul className="mt-10 space-y-4 text-sm text-zinc-300">
                {[
                  'Unlimited AI Mediation Sessions',
                  'Advanced Context & Pattern Recognition',
                  'Shared Relationship Goal Tracking',
                  'Complete Conversation History Archive',
                  'Priority Support'
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
