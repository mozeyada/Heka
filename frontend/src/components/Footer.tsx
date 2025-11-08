'use client';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Heka</h3>
            <p className="text-sm text-gray-400">
              AI-powered couple argument resolution. Build stronger relationships, one conversation at a time.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/legal/terms" className="hover:text-white hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/legal/privacy" className="hover:text-white hover:underline">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/settings" className="hover:text-white hover:underline">
                  Settings
                </a>
              </li>
              <li>
                <span className="text-gray-400">Contact: [To be filled]</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Heka. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Heka is not a substitute for professional therapy or crisis intervention.
          </p>
        </div>
      </div>
    </footer>
  );
}


