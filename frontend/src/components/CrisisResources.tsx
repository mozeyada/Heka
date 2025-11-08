'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CrisisResourcesProps {
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export function CrisisResources({ onAccept, showAcceptButton = true }: CrisisResourcesProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Important Safety Notice
          </h3>
          <p className="text-sm text-red-800 mb-3">
            <strong>Heka is a communication tool, NOT a substitute for professional therapy or crisis intervention.</strong>
          </p>
          
          <p className="text-sm text-red-800 mb-4">
            If you or your partner are experiencing:
          </p>
          <ul className="list-disc list-inside text-sm text-red-800 mb-4 space-y-1">
            <li>Domestic violence or abuse</li>
            <li>Mental health crisis</li>
            <li>Suicidal thoughts</li>
            <li>Substance abuse</li>
          </ul>

          <p className="text-sm text-red-800 font-semibold mb-3">
            Please seek immediate professional help:
          </p>
          <div className="bg-white rounded-lg p-3 mb-4 space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">🚨 Emergency:</span>
              <a href="tel:000" className="text-blue-600 hover:underline">000</a>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">📞 Lifeline:</span>
              <a href="tel:131114" className="text-blue-600 hover:underline">13 11 14</a>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">💬 Beyond Blue:</span>
              <a href="tel:1300224636" className="text-blue-600 hover:underline">1300 22 4636</a>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 mr-2">❤️ Relationships Australia:</span>
              <a href="tel:1300364277" className="text-blue-600 hover:underline">1300 364 277</a>
            </div>
          </div>

          <p className="text-xs text-red-700 mb-4">
            By continuing, you acknowledge that Heka is not professional counseling and understand 
            when to seek professional help.
          </p>

          {showAcceptButton && !accepted && (
            <div className="mt-4">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
              >
                I Understand - Continue
              </button>
            </div>
          )}

          {accepted && (
            <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
              ✓ Acknowledged
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


