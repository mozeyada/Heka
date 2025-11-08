'use client';

export default function PrivacyPolicyPage() {
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
              <strong>⚠️ Important Notice:</strong> This is a placeholder Privacy Policy. 
              Legal counsel must review and finalize before launch.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">Last Updated: [To be filled by legal counsel]</p>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              This Privacy Policy will be drafted by qualified Australian legal counsel 
              in compliance with the Australian Privacy Act 1988.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What This Policy Will Cover</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Information We Collect</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Personal information (email, name, age)</li>
              <li>Relationship data (arguments, perspectives)</li>
              <li>Usage data</li>
              <li>Payment information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>To provide our services</li>
              <li>AI processing (OpenAI)</li>
              <li>Payment processing (Stripe)</li>
              <li>Service improvements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Data Storage & Security</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Storage location (Australia/cloud)</li>
              <li>Encryption methods</li>
              <li>Security measures</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Your Rights</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Access your data</li>
              <li>Export your data</li>
              <li>Delete your data</li>
              <li>Correct inaccurate data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5. Contact Us</h3>
            <p className="text-gray-700 mb-6">
              For privacy inquiries or data requests, please contact us at: [To be filled]
            </p>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Awaiting legal counsel review<br />
                <strong>Next Step:</strong> Hire Australian legal counsel to draft final Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
