'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Heka</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Legal Review Required:</strong> This document is a draft and must be reviewed by qualified Australian legal counsel before final implementation.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-4">Last Updated: November 8, 2025</p>
          <p className="text-sm text-gray-500 mb-8">Version: 1.0 (Draft - Awaiting Legal Review)</p>

          <div className="prose max-w-none space-y-6">
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Heka ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use our Service.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Age Requirement:</strong> You must be at least 16 years old to use Heka. By registering, you confirm that you are 16 years of age or older. We reserve the right to verify your age and suspend accounts that violate this requirement.
              </p>
              <p className="text-gray-700">
                These Terms constitute a legally binding agreement between you and Heka. If you are using Heka on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Heka is an AI-powered platform designed to assist couples in resolving disagreements and arguments through neutral AI-mediated communication. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>AI-powered analysis of relationship arguments</li>
                <li>Mediation insights and suggestions</li>
                <li>Relationship check-ins and goal tracking</li>
                <li>Subscription-based access to premium features</li>
              </ul>
              
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Important Medical/Therapy Disclaimer</h3>
                <p className="text-red-800 text-sm mb-2">
                  <strong>Heka is NOT a substitute for professional therapy, counseling, or mental health treatment.</strong>
                </p>
                <p className="text-red-800 text-sm mb-2">Heka does not provide:</p>
                <ul className="list-disc list-inside text-red-800 text-sm space-y-1 mb-2">
                  <li>Diagnosis of mental health conditions</li>
                  <li>Treatment of mental health disorders</li>
                  <li>Professional relationship counseling</li>
                  <li>Crisis intervention services</li>
                </ul>
                <p className="text-red-800 text-sm mb-2">
                  <strong>If you or your partner are experiencing:</strong>
                </p>
                <ul className="list-disc list-inside text-red-800 text-sm space-y-1 mb-2">
                  <li>Domestic violence or abuse</li>
                  <li>Severe mental health crises</li>
                  <li>Suicidal thoughts or behaviors</li>
                  <li>Substance abuse issues</li>
                </ul>
                <p className="text-red-800 text-sm mb-2">
                  <strong>Please seek immediate professional help:</strong>
                </p>
                <ul className="list-none text-red-800 text-sm space-y-1">
                  <li>Emergency Services: <strong>000</strong> (Australia)</li>
                  <li>Lifeline: <strong>13 11 14</strong> (Australia)</li>
                  <li>Beyond Blue: <strong>1300 22 4636</strong></li>
                  <li>Relationships Australia: <strong>1300 364 277</strong></li>
                </ul>
                <p className="text-red-800 text-sm mt-2">
                  We recommend consulting with a licensed therapist, counselor, or mental health professional for serious relationship issues or when Heka's suggestions indicate professional intervention may be beneficial.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Acceptable Use Policy</h2>
              <p className="text-gray-700 mb-4">You agree to use Heka only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Use Heka for abuse, harassment, threats, or any form of violence</li>
                <li>Share your login credentials with others</li>
                <li>Attempt to manipulate, reverse-engineer, or interfere with AI responses</li>
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Use automated systems to access the Service without authorization</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit viruses, malware, or harmful code</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use the Service for commercial purposes without authorization</li>
              </ul>
              <p className="text-gray-700">
                Violation of this Acceptable Use Policy may result in immediate suspension or termination of your account without refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Service Limitations</h2>
              <p className="text-gray-700 mb-4">You acknowledge and agree that:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>No Guarantee of Outcomes:</strong> Heka does not guarantee that arguments will be resolved or relationships will improve. Results vary based on individual circumstances.</li>
                <li><strong>AI Limitations:</strong> AI-generated insights are advisory only and may contain errors, biases, or limitations. AI does not replace human judgment or professional advice.</li>
                <li><strong>Service Availability:</strong> We do not guarantee uninterrupted, secure, or error-free service. The Service may be unavailable due to maintenance, updates, or technical issues.</li>
                <li><strong>No Medical Advice:</strong> Heka does not provide medical, psychological, or therapeutic advice. Always consult qualified professionals for serious issues.</li>
                <li><strong>User Responsibility:</strong> You are solely responsible for decisions made based on Heka's suggestions. We are not liable for any outcomes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Subscription Terms</h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Subscription Tiers</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Free Tier:</strong> 7-day trial with up to 5 argument resolutions</li>
                <li><strong>Basic Tier:</strong> $9.99/month - Unlimited arguments</li>
                <li><strong>Premium Tier:</strong> $19.99/month - Unlimited arguments + premium features</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Billing and Payment</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Subscriptions are billed monthly in advance</li>
                <li>Payments are processed securely through Stripe</li>
                <li>All prices are in Australian Dollars (AUD) unless otherwise stated</li>
                <li>Prices may change with 30 days' notice to existing subscribers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Cancellation and Refunds</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>No refunds for partial billing periods</li>
                <li>Refunds may be provided at our discretion for exceptional circumstances</li>
                <li>Free tier users may cancel anytime without charge</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.4 Usage Limits</h3>
              <p className="text-gray-700 mb-4">
                Free tier users are limited to 5 argument resolutions during the 7-day trial period. Paid subscribers have unlimited access according to their tier. We reserve the right to implement fair usage policies to prevent abuse.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                <strong>Your Content:</strong> You retain ownership of all content you submit to Heka (arguments, perspectives, goals). By using the Service, you grant Heka a non-exclusive, worldwide, royalty-free license to use, store, and process your content solely for the purpose of providing the Service.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Platform and AI Insights:</strong> Heka retains all rights, title, and interest in the Platform, including all software, AI models, insights generated, designs, and trademarks. AI-generated insights are owned by Heka but are provided to you for your personal use.
              </p>
              <p className="text-gray-700">
                You may not copy, reproduce, distribute, or resell AI-generated insights or any part of the Platform without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Account Termination</h2>
              <p className="text-gray-700 mb-4">We reserve the right to suspend or terminate your account if:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>You violate these Terms or our Acceptable Use Policy</li>
                <li>You engage in fraudulent, abusive, or illegal activity</li>
                <li>You fail to pay subscription fees</li>
                <li>We determine, in our sole discretion, that your use poses a risk to other users</li>
              </ul>
              <p className="text-gray-700">
                Upon termination, your right to use the Service immediately ceases. We may delete your account and data in accordance with our Privacy Policy. No refunds will be provided for terminated accounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                <strong>To the maximum extent permitted by Australian Consumer Law:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Heka is provided "as is" and "as available" without warranties of any kind</li>
                <li>We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose</li>
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>We are not liable for any relationship outcomes, decisions made based on AI suggestions, or emotional distress</li>
                <li>Our total liability is limited to the amount you paid for the Service in the 12 months preceding the claim</li>
              </ul>
              <p className="text-gray-700">
                Nothing in these Terms excludes or limits our liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless Heka, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your use of Heka is also governed by our Privacy Policy, which explains how we collect, use, and protect your information. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
              </p>
              <p className="text-gray-700">
                Please review our Privacy Policy at <a href="/legal/privacy" className="text-blue-600 hover:underline">/legal/privacy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Posting the updated Terms on our website</li>
                <li>Sending an email to your registered email address</li>
                <li>Displaying a notice in the Service</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service and cancel your subscription.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                <strong>Governing Law:</strong> These Terms are governed by the laws of Australia and the state/territory in which Heka operates.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Dispute Resolution Process:</strong>
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 mb-4">
                <li>Contact us first to attempt to resolve the dispute informally</li>
                <li>If informal resolution fails, disputes will be resolved through binding arbitration in Australia</li>
                <li>You waive any right to participate in class-action lawsuits</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Australian Consumer Law</h2>
              <p className="text-gray-700 mb-4">
                Our services come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>A replacement or refund for a major failure</li>
                <li>Compensation for any other reasonably foreseeable loss or damage</li>
                <li>Services to be provided with due care and skill</li>
                <li>Services to be fit for the disclosed purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-1">
                <li><strong>Email:</strong> [To be filled - legal@heka.app]</li>
                <li><strong>Address:</strong> [To be filled - Australian business address]</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Draft Version 1.0 - Awaiting Legal Counsel Review<br />
                <strong>Next Step:</strong> Engage qualified Australian legal counsel to review and finalize these Terms of Service before public launch.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
