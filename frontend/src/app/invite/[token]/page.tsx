'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCouplesStore } from '@/store/couplesStore';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const rawToken = params?.token as string;
  // Clean token - remove any extra text, query params, fragments, or whitespace
  const cleanToken = (token: string | undefined): string | null => {
    if (!token) return null;
    // Remove query params, fragments, and extra text
    let cleaned = token.split('?')[0]?.split('#')[0]?.trim();
    // Remove any non-URL-safe characters that might have been appended
    // But keep URL-safe characters like underscore, dash
    cleaned = cleaned.replace(/[^a-zA-Z0-9\-_.~]/g, '');
    return cleaned || null;
  };
  
  const token = cleanToken(rawToken);
  
  const { isAuthenticated, user } = useAuthStore();
  const { fetchMyCouple } = useCouplesStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'needs_auth'>('loading');
  const [message, setMessage] = useState('');
  const [inviteeEmail, setInviteeEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link. Please check the link and try again.');
      return;
    }

    // Check authentication status
    const checkAuth = async () => {
      const authToken = localStorage.getItem('access_token');
      if (!authToken) {
        // Fetch invitation details to show email
        try {
          // Note: We can't get invitation details without auth, so we'll show login/register options
          // Store token for after login/register
          sessionStorage.setItem('pending_invitation_token', token);
          setStatus('needs_auth');
          setMessage('Please login or register to accept this invitation');
        } catch (err) {
          setStatus('needs_auth');
          setMessage('Please login or register to accept this invitation');
        }
        return;
      }
      
      // User is authenticated, accept invitation
      acceptInvitation();
    };

    checkAuth();
  }, [token]);

  const acceptInvitation = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation token');
      return;
    }

    try {
      const authToken = localStorage.getItem('access_token');
      if (!authToken) {
        setStatus('needs_auth');
        setMessage('Please login first');
        sessionStorage.setItem('pending_invitation_token', token);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/couples/accept-invitation/${token}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setStatus('success');
      setMessage('Invitation accepted! Couple profile created.');
      
      // Clear pending invitation token
      sessionStorage.removeItem('pending_invitation_token');
      
      // Refresh couple status
      await fetchMyCouple();
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      const errorMsg = error.response?.data?.detail || 'Failed to accept invitation';
      setMessage(errorMsg);
      
      // If error is about email mismatch, suggest registering
      if (errorMsg.includes('different email')) {
        setStatus('needs_auth');
        setMessage('This invitation is for a different email. Please register with the email address that received the invitation.');
      }
      
      console.error('Accept invitation error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Processing invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'needs_auth') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Heka</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
            <div className="text-blue-600 text-4xl sm:text-6xl mb-3 sm:mb-4">📧</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">You've Been Invited!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">{message}</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 px-4">
              If you don't have an account yet, register with the email address that received this invitation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href={`/register?invite=${encodeURIComponent(token || '')}`}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Create Account
              </Link>
              <Link
                href={`/login?invite=${encodeURIComponent(token || '')}`}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 text-sm sm:text-base"
              >
                Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Heka</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
          {status === 'success' ? (
            <>
              <div className="text-green-600 text-4xl sm:text-6xl mb-3 sm:mb-4">✓</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Invitation Accepted!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">{message}</p>
              <p className="text-xs sm:text-sm text-gray-500 px-4">Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <div className="text-red-600 text-4xl sm:text-6xl mb-3 sm:mb-4">✗</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Invitation Failed</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center px-4">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                >
                  Go to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
