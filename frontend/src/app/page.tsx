'use client';

import { useEffect } from 'react';
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
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Heka</h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-2">
          AI-Powered Couple Argument Resolution
        </p>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Build a stronger relationship and resolve conflicts when they arise. 
          Get neutral AI mediation to help you understand each other better.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <a
            href="/register"
            className="w-full sm:w-auto inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg text-sm sm:text-base"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 font-semibold shadow-lg border border-gray-200 text-sm sm:text-base"
          >
            Sign In
          </a>
        </div>
        
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left px-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Mediation</h3>
            <p className="text-sm text-gray-600">
              Get neutral, unbiased analysis of both perspectives with AI-powered insights.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">💬 Dual Perspective</h3>
            <p className="text-sm text-gray-600">
              Both partners share their side. Heka helps you find common ground.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Progress Tracking</h3>
            <p className="text-sm text-gray-600">
              Track your relationship health and see improvements over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

