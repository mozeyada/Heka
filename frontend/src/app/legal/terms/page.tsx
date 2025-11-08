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
              <strong>⚠️ Important Notice:</strong> This is a placeholder Terms of Service. 
              Legal counsel must review and finalize before launch.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-4">Last Updated: [To be filled by legal counsel]</p>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              These Terms of Service will be drafted by qualified Australian legal counsel.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What These Terms Will Cover</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-700 mb-6">
              By using Heka, you agree to these terms. You must be 16 years or older to use our service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Service Description</h3>
            <p className="text-gray-700 mb-6">
              Heka provides AI-mediated communication tools to help couples resolve arguments. 
              Heka is NOT a substitute for professional therapy, counseling, or mental health treatment.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Acceptable Use</h3>
            <p className="text-gray-700 mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Use Heka for abuse, harassment, or threats</li>
              <li>Share your login credentials</li>
              <li>Manipulate AI responses</li>
              <li>Provide false information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Service Limitations</h3>
            <p className="text-gray-700 mb-4">Important disclaimers:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>NOT professional therapy or medical advice</li>
              <li>NOT crisis intervention services</li>
              <li>AI has limitations and may make mistakes</li>
              <li>No guarantees about service outcomes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Subscription Terms</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Free tier limitations (7-day trial, 5 arguments)</li>
              <li>Paid subscriptions billed monthly</li>
              <li>Cancellation and refund policies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6. Limitation of Liability</h3>
            <p className="text-gray-700 mb-6">
              Heka is provided "as is" without warranties. We are not liable for any damages 
              arising from use of the service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7. Governing Law</h3>
            <p className="text-gray-700 mb-6">
              These terms are governed by Australian law. Disputes will be resolved in Australian courts.
            </p>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Awaiting legal counsel review<br />
                <strong>Next Step:</strong> Hire Australian legal counsel to draft final Terms of Service
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
