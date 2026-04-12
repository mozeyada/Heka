'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { useAuthStore } from '@/store/authStore';

const dataCategories = [
  {
    title: 'Account and identity data',
    items: [
      'Name, email address, age, password hash, account status, and the dates/versions of your terms and privacy acknowledgements.',
      'Authentication and session data such as access tokens, refresh tokens where supported, and account recovery tokens.',
      'Partner invitation details, including the invitee email address and invitation status.',
    ],
  },
  {
    title: 'Relationship workspace data',
    items: [
      'Couple profile data, arguments/issues, perspectives, AI-generated insights, weekly check-in responses, shared goals, progress updates, and in-app notifications.',
      'Metadata needed to operate shared workflows, such as who created an item, whether it is archived for one partner, and timestamps for updates.',
      'Highly personal relationship content that you and your partner choose to enter into Heka.',
    ],
  },
  {
    title: 'Billing and subscription data',
    items: [
      'Subscription tier, trial status, current billing period, usage counts, Stripe customer IDs, Stripe subscription IDs, and checkout/session metadata.',
      'We do not store your full payment card number or card security code.',
    ],
  },
  {
    title: 'Device, diagnostics, and app activity data',
    items: [
      'Browser, operating system, app/device type, IP address, request logs, and basic service diagnostics generated when you use Heka.',
      'Push-notification device IDs and push tokens if you enable notifications on mobile.',
      'Crash diagnostics and product analytics if those tools are enabled in a production release.',
    ],
  },
];

const providerRows = [
  {
    name: 'OpenAI',
    purpose: 'AI mediation, summaries, suggestions, and related model outputs.',
  },
  {
    name: 'Stripe',
    purpose: 'Subscription billing, checkout, renewals, receipts, and payment administration.',
  },
  {
    name: 'MongoDB Atlas, Railway, and Vercel',
    purpose: 'Database hosting, application hosting, infrastructure, logging, content delivery, and runtime operations.',
  },
  {
    name: 'Resend or other transactional email providers',
    purpose: 'Password reset, invitation, and account/service email delivery.',
  },
  {
    name: 'Sentry and Mixpanel, if enabled in a released build',
    purpose: 'Crash reporting, error diagnostics, and product analytics.',
  },
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

export default function PrivacyPolicyPage() {
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
        title="Privacy Policy"
        description="How Heka collects, uses, shares, stores, and protects personal information."
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
              href="/legal/terms"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <FileText className="h-4 w-4" />
              Terms of Service
            </Link>
          </div>
        }
      />

      <div className="app-container max-w-4xl pb-8">
        <div className="section-shell space-y-8 border border-white/10 bg-black/25 p-8 md:p-10">
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-5">
            <p className="text-sm font-semibold text-teal-100">
              Summary: Heka handles account data, shared relationship content, billing metadata, and optional mobile notification/diagnostic data to operate the service. We do not sell your personal information or run third-party advertising based on your relationship content.
            </p>
          </div>

          <div className="border-b border-white/10 pb-6 text-sm text-zinc-400">
            <p>Last updated: April 5, 2026</p>
            <p className="mt-1">
              This policy is designed for public publication and should be kept aligned with the app’s live data practices and App Store disclosures.
            </p>
          </div>

          <div className="space-y-10">
            <Section title="1. Who We Are and Scope">
              <p>
                Heka is a relationship communication and reflection platform. This Privacy Policy applies to the Heka website, mobile app, APIs, customer support interactions, and related services that link to or reference this policy.
              </p>
              <p>
                This policy is written to support compliance with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles, while also describing how Heka handles data for users in other regions. If local law gives you additional rights, we will honor them where required.
              </p>
              <p>
                Heka is not a crisis service, healthcare provider, law firm, or emergency response provider. Please do not use Heka to seek urgent medical, legal, or safety assistance.
              </p>
            </Section>

            <Section title="2. What We Collect">
              <p>
                We collect and hold the following categories of information:
              </p>
              <div className="space-y-5">
                {dataCategories.map((category) => (
                  <div key={category.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-base font-semibold text-white">{category.title}</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
                      {category.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p>
                Some of the content you provide to Heka may be deeply private or intimate. While not all of it is “sensitive information” as defined by Australian law, we treat relationship content as high-risk personal information because misuse or exposure could cause real harm.
              </p>
            </Section>

            <Section title="3. How We Collect Information">
              <ul className="list-disc space-y-2 pl-5">
                <li>Directly from you when you register, log in, invite a partner, create an issue, submit a perspective, complete a check-in, create a goal, export data, request deletion, or contact us.</li>
                <li>From your partner when they invite you to Heka or interact with shared couple content.</li>
                <li>Automatically from your device, browser, app session, infrastructure logs, and mobile push registration where applicable.</li>
                <li>From service providers involved in payments, email delivery, diagnostics, analytics, hosting, and AI processing.</li>
              </ul>
            </Section>

            <Section title="4. Why We Use Information">
              <ul className="list-disc space-y-2 pl-5">
                <li>To create and maintain user accounts, authenticate sessions, and protect account access.</li>
                <li>To operate the shared couple workspace, including invitations, issues, perspectives, goals, check-ins, notifications, and subscription features.</li>
                <li>To generate AI-assisted summaries, suggestions, and mediation outputs you request.</li>
                <li>To process billing, manage trials and subscriptions, and prevent misuse of paid features.</li>
                <li>To send transactional emails such as password resets, account/security messages, billing notices, and invitation emails.</li>
                <li>To monitor performance, troubleshoot errors, secure the service, detect abuse, and improve reliability.</li>
                <li>To analyze product usage at an aggregated or de-identified level to improve the service.</li>
                <li>To comply with legal obligations, enforce our terms, and protect users, Heka, and the public.</li>
              </ul>
            </Section>

            <Section title="5. AI Processing">
              <p>
                When you ask Heka to generate AI output, relevant relationship content and prompts are sent to OpenAI to process that request. This may include issue titles, perspectives, check-in context, or other text required to produce the requested output.
              </p>
              <p>
                According to OpenAI’s current official API data controls documentation, data sent through the OpenAI API is not used to train OpenAI models by default unless a customer explicitly opts in, and abuse-monitoring logs are generally retained for up to 30 days by default. Heka’s current implementation uses the OpenAI API for these features.
              </p>
              <p>
                AI outputs are generated assistance, not professional medical, legal, therapeutic, or emergency advice. You should not rely on Heka as a substitute for a licensed clinician, lawyer, or crisis service.
              </p>
            </Section>

            <Section title="6. When We Share Information">
              <p>We do not sell or rent your personal information. We share information only as needed to operate Heka or where required by law.</p>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-zinc-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Provider or category</th>
                      <th className="px-4 py-3 font-semibold">Why data may be shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-zinc-400">
                    {providerRows.map((row) => (
                      <tr key={row.name}>
                        <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                        <td className="px-4 py-3">{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                We may also disclose information if required by law, court order, lawful regulatory request, or where necessary to establish, exercise, or defend legal claims, prevent fraud, or protect safety.
              </p>
            </Section>

            <Section title="7. International Data Transfers">
              <p>
                Because Heka uses third-party infrastructure and processors, personal information may be stored in or disclosed to recipients outside Australia. Likely locations currently include Australia, Singapore, the United States, and other countries where our hosting, content delivery, payments, email, diagnostics, analytics, and AI providers operate.
              </p>
              <p>
                Where Australian law applies, we take reasonable steps to ensure overseas recipients protect personal information in a way that is consistent with our obligations, including through vendor due diligence, contractual controls, and access restrictions.
              </p>
            </Section>

            <Section title="8. Data Retention">
              <ul className="list-disc space-y-2 pl-5">
                <li>Account and shared workspace data are retained while the account and couple workspace remain active.</li>
                <li>Password reset tokens, invitation tokens, and similar short-lived security artifacts expire automatically after limited periods.</li>
                <li>Billing, transaction, tax, fraud, and audit records may be retained for as long as required by law or reasonably necessary to resolve disputes, enforce agreements, or maintain financial records.</li>
                <li>Operational logs, diagnostics, and processor-held logs may be retained according to the relevant provider’s retention periods and our security needs.</li>
                <li>When you delete your account, we may delete, de-identify, or anonymize certain records. Because Heka is a shared two-person product, some shared records may be retained in de-identified or partner-preserving form so the remaining user’s workspace is not corrupted or legally relevant records are not improperly destroyed.</li>
              </ul>
            </Section>

            <Section title="9. Security">
              <p>
                We use administrative, technical, and organizational measures designed to protect personal information, including access controls, encryption in transit, hosted infrastructure controls, authentication protections, and logging/monitoring.
              </p>
              <p>
                No system is perfectly secure. If Heka becomes aware of an eligible data breach under applicable Australian law, we will take the steps required by the Notifiable Data Breaches scheme, including notifying affected individuals and the OAIC where required.
              </p>
            </Section>

            <Section title="10. Your Choices and Rights">
              <p>You can manage privacy-related choices in the app and by contacting us.</p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong>Access and export:</strong> Heka currently provides a data export function in account settings.</li>
                <li><strong>Correction:</strong> You may request correction of inaccurate account data by contacting us. Some profile details may also be updated inside the product as those controls expand.</li>
                <li><strong>Deletion:</strong> Heka currently provides an account deletion workflow. Deletion may result in deletion, de-identification, or anonymization rather than total historical erasure in every case, especially for shared or legally required records.</li>
                <li><strong>Notifications:</strong> You can manage many relationship-notification preferences in settings, and you can disable push notifications through your device settings.</li>
                <li><strong>Marketing:</strong> If we send optional marketing communications in the future, you will be able to unsubscribe. Account, security, billing, and legally required messages may still be sent.</li>
                <li><strong>Other regional rights:</strong> Depending on where you live, you may have additional rights such as objection, restriction, portability, appeal, or complaint rights under local law.</li>
              </ul>
            </Section>

            <Section title="11. Children and Age Limits">
              <p>
                Heka is not intended for children under 16. We require users to be at least 16 years old. If you believe a person under 16 has provided personal information to Heka, contact us and we will take appropriate steps.
              </p>
            </Section>

            <Section title="12. Complaints and Contact">
              <p>
                For privacy requests, corrections, complaints, or accessibility requests for a copy of this policy, contact us at{' '}
                <a href="mailto:hello@heka.app?subject=Privacy%20Request" className="text-teal-300 hover:text-teal-200">
                  hello@heka.app
                </a>
                {' '}with the subject line <span className="font-semibold text-white">Privacy Request</span>.
              </p>
              <p>
                We aim to respond within a reasonable period and, for Australian privacy complaints, generally within 30 days where practical. If you are not satisfied with our response, you may contact the Office of the Australian Information Commissioner at{' '}
                <a href="https://www.oaic.gov.au/" className="text-teal-300 hover:text-teal-200">
                  oaic.gov.au
                </a>
                .
              </p>
            </Section>

            <Section title="13. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in Heka’s features, data practices, service providers, or legal obligations. When we do, we will update the “Last updated” date above and, where required, provide additional notice.
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* Guest conversion CTA — shown only to unauthenticated visitors who just read the full policy */}
      {!isAuthenticated && (
        <div className="app-container max-w-4xl pb-12">
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-950/60 via-black/40 to-indigo-950/60 p-8 backdrop-blur-xl md:p-10">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">You're making an informed decision</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Ready to bring calm to your conversations?
                </h2>
                <p className="mt-2 max-w-md text-sm text-zinc-400">
                  Your data is handled with care. Start your 7-day free trial — no payment required.
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
