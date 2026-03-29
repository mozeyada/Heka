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
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-teal-500/30 font-sans">
      {/* Immersive Space Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50vh] w-[50vh] rounded-full bg-teal-900/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-900/30 blur-[150px]" />
        <div className="absolute top-[40%] left-[60%] h-[30vh] w-[30vh] rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
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
