'use client';

import Link from 'next/link';
import { PageHeading } from '@/components/PageHeading';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information."
        actions={
          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container max-w-4xl">
        <div className="section-shell p-8">
          <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <p className="text-sm font-semibold text-yellow-800">
              ⚠️ Legal Review Required: This document is a draft and must be reviewed by qualified Australian legal counsel before final implementation.
            </p>
          </div>

          <div className="mb-8 border-b border-gray-200 pb-6">
            <p className="text-sm text-neutral-500">Last Updated: November 8, 2025</p>
            <p className="mt-1 text-xs text-neutral-400">Version: 1.0 (Draft - Awaiting Legal Review)</p>
          </div>

          <div className="prose prose-sm prose-neutral max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Heka ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered couple argument resolution platform ("Service").
              </p>
              <p className="text-gray-700 mb-4">
                This Privacy Policy complies with the Australian Privacy Act 1988 and the Australian Privacy Principles (APPs). By using our Service, you consent to the data practices described in this policy.
              </p>
              <p className="text-gray-700">
                If you do not agree with this Privacy Policy, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">We collect the following personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Email address, name, age (for age verification)</li>
                <li><strong>Profile Information:</strong> Relationship status, preferences</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store full credit card details)</li>
                <li><strong>Contact Information:</strong> Email address for communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Relationship Data</h3>
              <p className="text-gray-700 mb-4">We collect sensitive relationship information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Arguments and disagreements you create</li>
                <li>Perspectives and viewpoints you submit</li>
                <li>AI-generated insights and suggestions</li>
                <li>Relationship goals and check-in responses</li>
                <li>Progress tracking data</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Note:</strong> This information is highly sensitive. We treat it with the highest level of security and confidentiality.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Usage Data</h3>
              <p className="text-gray-700 mb-4">We automatically collect:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Device information (type, operating system, browser)</li>
                <li>IP address and location data (country/region level)</li>
                <li>Usage patterns and feature interactions</li>
                <li>Error logs and performance data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.4 Third-Party Data</h3>
              <p className="text-gray-700 mb-4">We may receive information from:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment processors (Stripe) - transaction data</li>
                <li>AI service providers (OpenAI) - processed content (see Section 3.2)</li>
                <li>Analytics providers - aggregated usage statistics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Service Provision</h3>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Provide and maintain the Service</li>
                <li>Process your registration and authenticate your account</li>
                <li>Generate AI-powered mediation insights</li>
                <li>Track relationship goals and check-ins</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send service-related communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 AI Processing</h3>
              <p className="text-gray-700 mb-4">
                When you submit arguments and perspectives, we send this information to OpenAI (our AI service provider) to generate mediation insights. OpenAI processes your data according to their privacy policy. We do not use your relationship data to train AI models without your explicit consent.
              </p>
              <p className="text-gray-700">
                <strong>Data Sharing with OpenAI:</strong> Your arguments and perspectives are shared with OpenAI solely for the purpose of generating AI insights. OpenAI is contractually obligated to protect your data and not use it for training purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Service Improvement</h3>
              <p className="text-gray-700 mb-4">We use aggregated, anonymized data to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Improve our AI models and suggestions</li>
                <li>Enhance user experience and features</li>
                <li>Identify and fix technical issues</li>
                <li>Conduct research and analytics (only with anonymized data)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.4 Legal Compliance</h3>
              <p className="text-gray-700 mb-4">We may use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Respond to legal requests and court orders</li>
                <li>Protect our rights and prevent fraud</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Storage and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Storage Location</h3>
              <p className="text-gray-700 mb-4">
                Your data is stored in secure cloud infrastructure. Primary data storage is in Australia where possible, with backups potentially stored in secure international data centers. We ensure all data transfers comply with Australian privacy laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Security Measures</h3>
              <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Encryption:</strong> Data encrypted in transit (HTTPS/TLS) and at rest</li>
                <li><strong>Authentication:</strong> Secure password hashing (bcrypt) and JWT tokens</li>
                <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                <li><strong>Backups:</strong> Regular encrypted backups with secure retention policies</li>
              </ul>
              <p className="text-gray-700">
                Despite these measures, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Data Retention</h3>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide the Service and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Data deleted within 30 days of account deletion request</li>
                <li><strong>Financial Records:</strong> Retained for 7 years as required by Australian law</li>
                <li><strong>Backups:</strong> Deleted according to retention schedule (typically 90 days)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Privacy Rights (Australian Privacy Principles)</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Access to Your Data</h3>
              <p className="text-gray-700 mb-4">
                You have the right to access the personal information we hold about you. You can:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Request a copy of your data through your account settings</li>
                <li>Export your data in JSON format</li>
                <li>Review what information we have collected</li>
              </ul>
              <p className="text-gray-700">
                We will respond to access requests within 30 days as required by Australian Privacy Act 1988.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Correction of Data</h3>
              <p className="text-gray-700 mb-4">
                You can correct inaccurate or incomplete personal information through your account settings or by contacting us. We will update your information promptly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Deletion of Data</h3>
              <p className="text-gray-700 mb-4">
                You have the right to request deletion of your personal information ("right to be forgotten"). You can:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Delete your account through account settings</li>
                <li>Request specific data deletion by contacting us</li>
                <li>We will delete your data within 30 days, except where retention is required by law</li>
              </ul>
              <p className="text-gray-700">
                <strong>Note:</strong> Financial records may be retained for 7 years for legal compliance. Deleted data will be anonymized or permanently removed from our systems.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.4 Opt-Out Rights</h3>
              <p className="text-gray-700 mb-4">You can:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Opt out of marketing emails (service emails will still be sent)</li>
                <li>Disable cookies through your browser settings</li>
                <li>Cancel your subscription at any time</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.5 Complaints</h3>
              <p className="text-gray-700 mb-4">
                If you believe we have breached the Australian Privacy Principles, you can:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Contact us first to resolve the issue</li>
                <li>File a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
                <li>OAIC contact: <a href="https://www.oaic.gov.au" className="text-blue-600 hover:underline">www.oaic.gov.au</a> or 1300 363 992</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 We Do NOT Sell Your Data</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Service Providers</h3>
              <p className="text-gray-700 mb-4">We share information with trusted service providers who assist us:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>OpenAI:</strong> AI processing (contractually bound to protect your data)</li>
                <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                <li><strong>MongoDB Atlas:</strong> Database hosting (encrypted, secure)</li>
                <li><strong>Email Providers:</strong> Transactional emails (Gmail SMTP or SendGrid)</li>
                <li><strong>Analytics:</strong> Aggregated, anonymized usage data only</li>
              </ul>
              <p className="text-gray-700">
                All service providers are contractually obligated to protect your data and use it only for specified purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose your information if required by law:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>To comply with court orders or legal processes</li>
                <li>To respond to government requests</li>
                <li>To protect our rights, property, or safety</li>
                <li>To prevent fraud or illegal activity</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.4 Business Transfers</h3>
              <p className="text-gray-700">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns (anonymized)</li>
                <li>Improve service performance</li>
              </ul>
              <p className="text-gray-700">
                You can control cookies through your browser settings. Disabling cookies may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Heka is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected information from a child under 16, we will delete that information immediately.
              </p>
              <p className="text-gray-700">
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Data Breach Notification</h2>
              <p className="text-gray-700 mb-4">
                In the event of a data breach that poses a risk of serious harm, we will:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Notify affected users as soon as practicable</li>
                <li>Notify the Office of the Australian Information Commissioner (OAIC) if required</li>
                <li>Provide clear information about what happened</li>
                <li>Explain steps being taken to address the breach</li>
                <li>Offer support and resources</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Some of our service providers (e.g., OpenAI, cloud infrastructure) may be located outside Australia. When we transfer your data internationally, we ensure:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Appropriate safeguards are in place</li>
                <li>Recipients are bound by privacy protections equivalent to Australian Privacy Principles</li>
                <li>Transfers comply with Australian Privacy Act 1988</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Posting the updated Privacy Policy on our website</li>
                <li>Sending an email to your registered email address</li>
                <li>Displaying a notice in the Service</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of the Service after changes become effective constitutes acceptance of the updated Privacy Policy. The "Last Updated" date at the top indicates when this policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> [To be filled - privacy@heka.app]</li>
                <li><strong>Address:</strong> [To be filled - Australian business address]</li>
                <li><strong>Phone:</strong> [To be filled]</li>
              </ul>
              <p className="text-gray-700 mt-4">
                For data access, correction, or deletion requests, you can also use the tools available in your account settings.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Draft Version 1.0 - Awaiting Legal Counsel Review<br />
                <strong>Next Step:</strong> Engage qualified Australian legal counsel to review and finalize this Privacy Policy before public launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
