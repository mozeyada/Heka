'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, ArrowRight } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { useAuthStore } from '@/store/authStore';

const subscriptionPoints = [
  'Heka currently supports a 7-day trial and paid subscription access for eligible couple accounts.',
  'Pricing, plan features, and any introductory offers are shown in the product or checkout flow at the time of purchase.',
  'Payments are processed by Stripe. We do not store your full payment card number or card security code.',
  'Paid subscriptions renew automatically until cancelled, unless the applicable checkout flow states otherwise.',
  'If you cancel, access usually continues until the end of the current paid period unless we state a different effect at checkout.',
  'Nothing in these Terms limits any non-excludable rights or remedies you have under the Australian Consumer Law.',
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-zinc-300">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen pb-20 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-teal-900/14 blur-[140px]" />
        <div className="absolute right-[-10%] top-[22%] h-[46vh] w-[46vh] rounded-full bg-indigo-900/14 blur-[155px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[34vh] w-[34vh] rounded-full bg-rose-900/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <PageHeading
        title="Terms of Service"
        description="The rules, rights, and limits that apply when you use Heka."
        actions={
          <div className="flex items-center gap-3">
            {/* Smart back button — context-aware */}
            <button
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {isAuthenticated ? 'Dashboard' : 'Home'}
            </button>
            {/* Cross-link to sibling legal doc */}
            <Link
              href="/legal/privacy"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Link>
          </div>
        }
      />

      <div className="app-container max-w-4xl pb-8">
        <div className="section-shell space-y-8 border border-white/10 bg-black/25 p-8 md:p-10">
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-5">
            <p className="text-sm font-semibold text-teal-100">
              Summary: Heka is a relationship communication platform, not a therapy, legal, or emergency service. These Terms govern account use, subscriptions, AI features, acceptable use, ownership, and the limits of our responsibility.
            </p>
          </div>

          <div className="border-b border-white/10 pb-6 text-sm text-zinc-400">
            <p>Last updated: April 5, 2026</p>
            <p className="mt-1">Version: 2026-04-05</p>
          </div>

          <div className="space-y-10">
            <Section title="1. Agreement and Eligibility">
              <p>
                These Terms of Service govern your access to and use of Heka’s website, mobile app, APIs, and related services. By creating an account, accessing, or using Heka, you agree to these Terms and our{' '}
                <Link href="/legal/privacy" className="text-teal-300 hover:text-teal-200">
                  Privacy Policy
                </Link>
                .
              </p>
              <p>
                You must be at least 16 years old to use Heka. By registering, you confirm that you meet that minimum age requirement and that the information you provide is accurate.
              </p>
              <p>
                If you use Heka on behalf of a business or organisation, you represent that you have authority to bind that entity to these Terms.
              </p>
            </Section>

            <Section title="2. What Heka Is and Is Not">
              <p>
                Heka is a digital relationship communication tool that helps couples record issues, share perspectives, review AI-assisted insights, complete check-ins, manage shared goals, and receive account or relationship notifications.
              </p>
              <p>
                Heka is not a healthcare provider, therapist, counsellor, law firm, domestic violence service, or emergency response provider. The service does not diagnose conditions, provide treatment, or replace professional advice.
              </p>
              <p>
                If you or someone else may be in immediate danger, experiencing abuse, self-harm risk, suicidal thinking, or a mental health crisis, stop using Heka and seek help from emergency services, a qualified clinician, or a local support service immediately.
              </p>
            </Section>

            <Section title="3. Accounts and Security">
              <ul className="list-disc space-y-2 pl-5">
                <li>You are responsible for keeping your login credentials secure and for activity that occurs under your account.</li>
                <li>You must not impersonate another person, share credentials inappropriately, or create accounts using false or misleading identity information.</li>
                <li>You must notify us promptly if you believe your account or device has been compromised.</li>
                <li>We may suspend or restrict access where reasonably necessary to protect users, enforce these Terms, investigate abuse, or respond to security issues.</li>
              </ul>
            </Section>

            <Section title="4. Shared Couple Features">
              <p>
                Heka is designed as a shared two-person product. When you connect with a partner, certain content and activity states become part of a shared workspace, including issues, perspectives, goals, check-ins, invitations, and related notifications.
              </p>
              <p>
                You are responsible for deciding what you share. Content entered into the shared workspace may be visible to your partner or remain associated with the shared relationship history, even if one partner later steps away from a specific item or deletes their account.
              </p>
              <p>
                Some shared items may be archived, de-identified, or preserved to avoid corrupting the remaining partner’s workspace or to comply with legal, billing, security, and record-keeping obligations.
              </p>
            </Section>

            <Section title="5. Acceptable Use">
              <p>You must use Heka lawfully and responsibly. You must not:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Use Heka to abuse, harass, threaten, stalk, exploit, or intimidate another person.</li>
                <li>Upload unlawful, fraudulent, defamatory, infringing, or malicious content.</li>
                <li>Use the service to facilitate violence, coercive control, self-harm encouragement, or criminal activity.</li>
                <li>Interfere with the service, bypass usage limits, scrape data, probe vulnerabilities, reverse engineer the platform except where non-excludable law permits it, or deploy bots without authorization.</li>
                <li>Attempt to access another user’s account or data without permission.</li>
                <li>Use Heka in a way that could harm the service, other users, or our providers.</li>
              </ul>
              <p>
                We may remove content, suspend features, or terminate access if we reasonably believe your use breaches these Terms, creates safety risk, or exposes Heka or other users to harm.
              </p>
            </Section>

            <Section title="6. AI Features">
              <p>
                Heka may use third-party AI providers, including OpenAI, to generate summaries, insights, prompts, and other outputs you request. AI outputs are generated assistance only.
              </p>
              <p>
                AI outputs may be incomplete, inaccurate, biased, or unsuitable for your situation. You are responsible for how you interpret and use them. Do not rely on Heka for medical, mental health, legal, crisis, safeguarding, or other high-stakes professional decision-making.
              </p>
              <p>
                We may limit, rate-limit, suspend, or change AI features at any time, including where provider capacity, cost, safety, or abuse controls require it.
              </p>
            </Section>

            <Section title="7. Subscriptions, Trials, and Billing">
              <ul className="list-disc space-y-2 pl-5">
                {subscriptionPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p>
                Free trial access and usage limits may change over time. If a paid plan is offered, the amount, currency, taxes, renewal terms, and plan inclusions displayed at checkout will control for that purchase.
              </p>
              <p>
                Except where required by law or stated otherwise, fees are generally non-refundable for partial billing periods, unused time, or unused features after a paid period begins.
              </p>
            </Section>

            <Section title="8. Intellectual Property and Content Rights">
              <p>
                You retain ownership of the content you submit to Heka. You grant Heka a non-exclusive, worldwide, royalty-free licence to host, store, process, reproduce, adapt, and display that content only as reasonably necessary to operate, secure, improve, and support the service in accordance with our Privacy Policy.
              </p>
              <p>
                Heka owns or licenses the platform, software, product design, branding, compilations, and service materials, excluding your content and third-party materials. These Terms do not transfer ownership of Heka’s intellectual property to you.
              </p>
              <p>
                You may use the service output for your personal, non-commercial use in connection with Heka. You must not resell, systematically extract, or commercially exploit the platform or AI outputs without our written permission.
              </p>
              <p>
                If you provide product feedback or suggestions, we may use them without restriction or compensation to you.
              </p>
            </Section>

            <Section title="9. Service Availability and Changes">
              <p>
                We aim to keep Heka available and secure, but we do not promise uninterrupted, error-free, or permanently available service. Maintenance, upgrades, outages, security responses, third-party provider failures, or abuse controls may affect availability.
              </p>
              <p>
                We may add, remove, or change features, pricing, AI models, limits, or workflows. If we make a material adverse change to a paid subscription offering, we will provide notice where required by law or reasonably practical.
              </p>
            </Section>

            <Section title="10. Suspension and Termination">
              <p>
                You may stop using Heka at any time. You may also use the account deletion tools available in the product, subject to the data-handling limits described in our Privacy Policy.
              </p>
              <p>
                We may suspend or terminate your access immediately if you materially breach these Terms, fail to pay applicable fees, create legal or security risk, misuse the platform, or if continued access is no longer commercially or operationally feasible.
              </p>
              <p>
                Clauses that by their nature should continue after termination, including payment obligations, intellectual property provisions, limitation of liability, consumer-law carve-outs, and dispute-related provisions, will survive termination.
              </p>
            </Section>

            <Section title="11. Consumer Rights and Liability Limits">
              <p>
                Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, statutory right, or remedy that cannot lawfully be excluded, including rights under the Australian Consumer Law.
              </p>
              <p>
                To the maximum extent permitted by law, Heka is provided on an “as is” and “as available” basis, and we exclude warranties not expressly stated in these Terms.
              </p>
              <p>
                To the maximum extent permitted by law, we are not liable for indirect, incidental, special, exemplary, punitive, or consequential loss, or for loss of profits, revenue, goodwill, data, or opportunity arising from or in connection with Heka.
              </p>
              <p>
                Where liability cannot be excluded but can be limited, our liability is limited, at our option, to resupplying the services or paying the cost of having the services supplied again. Subject to that, our aggregate liability for claims arising out of or connected with Heka is limited to the greater of the amount you paid to us for the service in the 12 months before the event giving rise to the claim, and any non-excludable minimum amount required by law.
              </p>
            </Section>

            <Section title="12. Disputes and Governing Law">
              <p>
                If you have a complaint or dispute, please contact us first so we have a reasonable opportunity to resolve it directly.
              </p>
              <p>
                These Terms are governed by the laws applicable in Australia, and where a court must determine a dispute, the courts of Queensland, Australia will have non-exclusive jurisdiction, unless mandatory consumer law gives you the right to bring a claim elsewhere.
              </p>
            </Section>

            <Section title="13. Changes to These Terms">
              <p>
                We may update these Terms from time to time to reflect product changes, legal requirements, pricing changes, safety practices, or provider changes. We will update the “Last updated” date above and, where required or reasonably appropriate, provide additional notice in the app, by email, or through the website.
              </p>
              <p>
                If you continue using Heka after updated Terms take effect, you agree to the revised Terms. If you do not agree, you must stop using Heka and cancel any paid subscription before the next renewal.
              </p>
            </Section>

            <Section title="14. Contact">
              <p>
                For legal notices, subscription questions, complaints, or Terms-related requests, contact{' '}
                <a href="mailto:hello@heka.app?subject=Terms%20Request" className="text-teal-300 hover:text-teal-200">
                  hello@heka.app
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* Guest conversion CTA — shown only to unauthenticated visitors who just read the full terms */}
      {!isAuthenticated && (
        <div className="app-container max-w-4xl pb-12">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-950/60 via-black/40 to-indigo-950/60 p-8 backdrop-blur-xl md:p-10">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">You know the rules. Now experience the calm.</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Ready to transform how you communicate?
                </h2>
                <p className="mt-2 max-w-md text-sm text-zinc-400">
                  Start your 7-day free trial — full access, no payment required.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.12)] transition hover:scale-[1.03]"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
