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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 pb-24 pt-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/80 to-transparent" />
          <div className="absolute left-0 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/50 blur-3xl" />
          <div className="absolute right-0 top-32 h-72 w-72 translate-x-1/2 rounded-full bg-pink-200/50 blur-3xl" />
        </div>

        <div className="app-container">
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
                Relationship AI
              </div>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Bring calm, clarity, and care to every tough conversation.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
                Heka listens to both sides, highlights what matters most, and guides you back to understanding—without
                taking sides or losing empathy.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
                <Link
                  href="/register"
                  className="btn-primary flex w-full items-center justify-center gap-2 px-10 py-3 text-base sm:w-auto"
                >
                  Start Your Free Trial
                  <span aria-hidden>&rarr;</span>
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary flex w-full items-center justify-center gap-2 border border-neutral-200 px-8 py-3 text-base sm:w-auto"
                >
                  View Demo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                    <span className="text-lg font-semibold text-indigo-600">7d</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Free trial</p>
                    <p className="text-xs text-neutral-500">No card required</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                    <span className="text-lg font-semibold text-indigo-600">92%</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Felt heard</p>
                    <p className="text-xs text-neutral-500">after one session</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                    <span className="text-lg font-semibold text-indigo-600">+4.6</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Relationship score</p>
                    <p className="text-xs text-neutral-500">average weekly uplift</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-neutral-500">
                Couples in beta report calmer conversations within three arguments.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-x-6 top-10 h-4/5 rounded-3xl bg-gradient-to-br from-indigo-200/50 to-pink-200/60 blur-2xl" />
              <div className="relative rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_20px_60px_rgba(79,70,229,0.15)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
                      in-session insights
                    </p>
                    <p className="mt-2 text-xl font-semibold text-neutral-900">Tonight&apos;s conversation</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                    Calm score 82
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-indigo-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Core Insight</p>
                    <p className="mt-2 text-sm text-indigo-900">
                      You both want to feel trusted with your decisions. Try leading with reassurance before sharing the
                      facts.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      Suggested next step
                    </p>
                    <p className="mt-2 text-sm text-neutral-700">
                      Set aside 15 minutes tomorrow to list what you appreciate about each other and exchange without
                      interruptions.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Tone check</p>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        Respectful
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700">
                      Elise&apos;s message felt calm and curious. Jordan&apos;s tone softened mid-way—keep leaning into those
                      clarifying questions.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-100/80 to-pink-100/80 p-4 text-sm text-neutral-700">
                  <span>Goal: Plan stress-free weekends</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600">
                    68% complete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-16">
        <div className="app-container">
          <div className="mx-auto flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Trusted by beta couples</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-900 sm:text-3xl">
                Designed with relationship experts
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-neutral-500 sm:grid-cols-4">
              <div className="rounded-full border border-neutral-200 px-4 py-2">Gottman Method</div>
              <div className="rounded-full border border-neutral-200 px-4 py-2">Nonviolent Comm.</div>
              <div className="rounded-full border border-neutral-200 px-4 py-2">EFT Principles</div>
              <div className="rounded-full border border-neutral-200 px-4 py-2">Solution-Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="app-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Everything you need to resolve conflict with confidence
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              Thoughtfully crafted workflows turn emotional friction into deeper understanding and practical next steps.
            </p>
          </div>

          <div className="mx-auto mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: 'AI Mediation that understands both sides',
                description:
                  'Structured prompts uncover needs, emotions, and patterns. Insights are grounded in proven relationship frameworks.',
                gradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
                iconPath: 'M12 6v12m6-6H6'
              },
              {
                title: 'Shared action plans you can agree on',
                description:
                  'Transform tension into clarity with bite-sized commitments, progress tracking, and gentle reminders.',
                gradient: 'from-pink-500/15 via-pink-500/5 to-transparent',
                iconPath: 'M5 13l4 4L19 7'
              },
              {
                title: 'Weekly check-ins that spot progress',
                description:
                  'Visualize tone shifts, needs met, and appreciation shared so you can celebrate growth—not just fix fires.',
                gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
                iconPath: 'M4 7h16M4 12h10m-6 5h6'
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-8 shadow-[0_15px_45px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(79,70,229,0.12)]"
              >
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient}`} />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 text-indigo-600"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.iconPath} />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 py-24">
        <div className="app-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">How Heka guides every session</h2>
            <p className="mt-4 text-base text-neutral-600">
              From first prompt to resolution, each step keeps you grounded, compassionate, and moving forward together.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Share both perspectives',
                description:
                  'Each partner answers guided questions that surface tone, needs, and the heart of the conflict—without feeling judged.'
              },
              {
                step: '02',
                title: 'Receive neutral insights',
                description:
                  'Heka highlights points of alignment, gently names patterns, and offers practical language to acknowledge one another.'
              },
              {
                step: '03',
                title: 'Move forward together',
                description:
                  'Agree on a plan with measurable next steps, keep momentum with check-ins, and track how the relationship is healing.'
              }
            ].map((step) => (
              <div key={step.step} className="relative rounded-3xl border border-white bg-white p-8 shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Step {step.step}</span>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{step.description}</p>
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500/90 to-pink-500/80 text-center text-2xl font-semibold text-white shadow-lg">
                  <span className="inline-flex h-full w-full items-center justify-center">{step.step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="app-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">Couples are already feeling the shift</h2>
            <p className="mt-4 text-base text-neutral-600">
              Early access partners say their toughest conversations now end with more care, not more distance.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                quote:
                  'We finally heard the why behind each other’s frustration. The insight summaries helped us validate each other immediately.',
                name: 'Elise & Jordan',
                meta: 'Together 6 years · Brisbane'
              },
              {
                quote:
                  'The guided prompts are magic. We stopped looping the same argument and actually built an action plan that stuck.',
                name: 'Nina & Priya',
                meta: 'Together 3 years · Melbourne'
              },
              {
                quote:
                  'Heka keeps us calm even when the topic is loaded. Seeing progress after each check-in keeps us motivated.',
                name: 'Sam & Lucas',
                meta: 'Together 8 years · Sydney'
              }
            ].map((testimonial) => (
              <div key={testimonial.name} className="rounded-3xl border border-neutral-100 bg-neutral-25 p-8 shadow-inner">
                <p className="text-sm leading-7 text-neutral-700">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-neutral-900">{testimonial.name}</p>
                  <p className="text-xs text-neutral-500">{testimonial.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-pink-500 py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent)]" />
        </div>
        <div className="app-container relative z-10">
          <div className="mx-auto max-w-2xl text-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Beta launch</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Ready to bring more grace into your next disagreement?
            </h2>
            <p className="mt-4 text-base text-indigo-100">
              Start your 7-day free trial and get full access to AI mediation, dual perspectives, and weekly relationship
              check-ins.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="btn-primary bg-white text-indigo-600 hover:text-indigo-700">
                Join the beta
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:border-white"
              >
                Explore the live demo
              </Link>
            </div>
            <p className="mt-6 text-xs text-indigo-100">
              We’ll help you onboard your partner and guide your first session step-by-step.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
