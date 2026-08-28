'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }

    if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen text-zinc-300 selection:bg-teal-500/30 font-sans">
      {/* Immersive Space Background (Fixed curtain across entire viewport) */}
      <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50vh] w-[50vh] rounded-full bg-teal-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-900/30 blur-[150px]" />
        <div className="absolute top-[40%] left-[60%] h-[30vh] w-[30vh] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>



      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-24 lg:pt-48">
        <div className="app-container">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                Relationship AI
              </div>
              <h1 className="mt-8 text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-[4.5rem] leading-[1.1]">
                Bring <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">calm, clarity,</span><br/>and care to every conversation.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                Heka listens to both sides, highlights what matters most, and guides you back to understanding—without taking sides or losing empathy.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  Start Your Free Trial
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
                >
                  Explore Demo
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="text-2xl font-semibold text-white">7<span className="text-teal-500 text-lg">d</span></div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Free Trial</p>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div>
                  <div className="text-2xl font-semibold text-white">92<span className="text-teal-500 text-lg">%</span></div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Felt Heard</p>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div>
                  <div className="text-2xl font-semibold text-white">+4.6</div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Score Uplift</p>
                </div>
              </div>

              {/* Trust micro-signals — directly below CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                {[
                  { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Encrypted & private' },
                  { icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', label: 'No ads, ever' },
                  { icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', label: 'Delete your data anytime' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <svg className="h-3.5 w-3.5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content: Premium Glass Card */}
            <div className="relative lg:ml-auto w-full max-w-lg perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 blur-3xl transform -rotate-6 rounded-[3rem]" />
              
              {/* Glassmorphism Shell */}
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">In-Session Insights</p>
                    <p className="mt-1 text-lg font-medium text-white">Tonight&apos;s conversation</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                    <span className="text-xs font-medium text-teal-300">Calm 82</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Core Insight Blob */}
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 transition-colors hover:bg-indigo-500/10">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Core Insight
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                      You both want to feel trusted with your decisions. Try leading with <span className="text-white font-medium">reassurance</span> before sharing facts.
                    </p>
                  </div>

                  {/* Suggestion Blob */}
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-5 transition-colors hover:bg-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Suggested Next Step</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      Set aside 15 minutes tomorrow to list what you appreciate about each other and exchange without interruptions.
                    </p>
                  </div>

                  {/* Tone Check */}
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Tone Check</p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">Respectful</span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Elise&apos;s message felt calm. Jordan&apos;s tone softened mid-way—keep leaning into clarifying questions.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 backdrop-blur-md">
                  <span className="text-xs font-medium text-zinc-300">Goal: Stress-free weekends</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[68%] h-full bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold text-white">68%</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Social Proof (Darkened) */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-12">
        <div className="app-container">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between text-center lg:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Trusted Architecture</p>
              <h2 className="mt-1 text-lg font-medium text-white">Designed alongside relationship experts</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {['Gottman Method', 'Nonviolent Comm.', 'EFT Principles', 'Solution-Focused'].map(m => (
                <div key={m} className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-zinc-400 backdrop-blur-sm">
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Bento Box Glass) */}
      <section className="relative z-10 py-32">
        <div className="app-container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Conflict resolution, <span className="text-zinc-500">engineered for clarity.</span>
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: 'Unbiased AI Mediation',
                desc: 'Structured prompts uncover needs and hidden patterns. Insights are grounded in proven frameworks.',
                icon: 'M12 6v12m6-6H6',
                color: 'text-teal-400',
                bg: 'bg-teal-500/10 border-teal-500/20'
              },
              {
                title: 'Actionable Agreements',
                desc: 'Transform tension into clarity with bite-sized commitments, progress tracking, and gentle reminders.',
                icon: 'M5 13l4 4L19 7',
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10 border-indigo-500/20'
              },
              {
                title: 'Weekly Progress Signals',
                desc: 'Visualize tone shifts, needs met, and appreciation shared so you can celebrate growth—not just fix fires.',
                icon: 'M4 7h16M4 12h10m-6 5h6',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20'
              }
            ].map((f) => (
              <div key={f.title} className="group relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/20">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${f.bg}`}>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${f.color}`}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Trust Section */}
      <section className="relative z-10 py-32 border-t border-white/5">
        <div className="app-container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-6">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy by Design
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Your relationship stays <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">between the two of you.</span>
            </h2>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Heka handles the most personal data imaginable. We built our privacy model the same way Signal, Apple, and ProtonMail built theirs — transparent commitments you can hold us to.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Never */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-400 mb-5">What we will never do</p>
              <ul className="space-y-4">
                {[
                  'Sell or share your relationship data with advertisers or data brokers',
                  'Use your conversations to train AI models',
                  'Give your content to your partner\'s family, employers, or lawyers',
                  'Allow any employee to casually browse your relationship conversations',
                  'Store your data longer than necessary',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                    <svg className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column: How it works + emergency door */}
            <div className="flex flex-col gap-6">
              {/* Encryption */}
              <div className="rounded-3xl border border-teal-500/15 bg-teal-500/[0.04] p-7 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
                    <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">Encrypted at Rest</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Argument and perspective content is encrypted at rest using AES-128 before it reaches our database. Your data is stored in Australia and Singapore. A breach of the database alone yields ciphertext — the application key is required to read it.
                </p>
              </div>

              {/* AI Disclosure */}
              <div className="rounded-3xl border border-indigo-500/15 bg-indigo-500/[0.04] p-7 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">Honest About AI</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  When AI mediates, your text is sent to OpenAI to generate a response. It is not stored beyond 30 days and is not used to train their models — per OpenAI's API terms.
                </p>
              </div>

              {/* Emergency door — transparent */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">When We Can Access Data</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We reserve access only for lawful Australian court orders, or credible imminent risk to life — exactly the same conditions Signal, Apple, and ProtonMail disclose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Dark CTA */}
      <section className="relative z-10 overflow-hidden border-t border-white/10 bg-black py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/20 to-transparent" />
        <div className="app-container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
              Ready to bring grace back to your conversations?
            </h2>
            <p className="mt-6 text-lg text-zinc-400">
              Start your 7-day free trial. Full access to AI mediation, dual perspectives, and premium check-ins.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto rounded-xl bg-teal-500 px-8 py-4 text-sm font-bold text-black transition hover:bg-teal-400 hover:scale-[1.02]">
                Join the Private Beta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
