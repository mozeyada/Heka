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
    <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900">
            Important Safety Notice
          </h3>
          <p className="mt-3 text-sm font-semibold text-red-800">
            Heka is a communication tool, NOT a substitute for professional therapy or crisis intervention.
          </p>
          
          <p className="mt-4 text-sm text-red-800">
            If you or your partner are experiencing:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-800">
            <li>• Domestic violence or abuse</li>
            <li>• Mental health crisis</li>
            <li>• Suicidal thoughts</li>
            <li>• Substance abuse</li>
          </ul>

          <p className="mt-4 text-sm font-semibold text-red-900">
            Please seek immediate professional help:
          </p>
          <div className="mt-3 space-y-2 rounded-xl border border-white/60 bg-white/90 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">🚨 Emergency</span>
              <a href="tel:000" className="font-semibold text-indigo-600 hover:text-indigo-500">000</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">📞 Lifeline</span>
              <a href="tel:131114" className="font-semibold text-indigo-600 hover:text-indigo-500">13 11 14</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">💬 Beyond Blue</span>
              <a href="tel:1300224636" className="font-semibold text-indigo-600 hover:text-indigo-500">1300 22 4636</a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">❤️ Relationships Australia</span>
              <a href="tel:1300364277" className="font-semibold text-indigo-600 hover:text-indigo-500">1300 364 277</a>
            </div>
          </div>

          <p className="mt-4 text-xs text-red-700">
            By continuing, you acknowledge that Heka is not professional counseling and understand when to seek professional help.
          </p>

          {showAcceptButton && !accepted && (
            <button
              onClick={handleAccept}
              className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-500 hover:-translate-y-0.5"
            >
              I Understand - Continue
            </button>
          )}

          {accepted && (
            <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
              ✓ Acknowledged
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


