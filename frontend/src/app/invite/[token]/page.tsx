'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCouplesStore } from '@/store/couplesStore';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const rawToken = params?.token as string;
  const cleanToken = (token: string | undefined): string | null => {
    if (!token) return null;
    let cleaned = token.split('?')[0]?.split('#')[0]?.trim();
    cleaned = cleaned.replace(/[^a-zA-Z0-9\-_.~]/g, '');
    return cleaned || null;
  };

  const token = cleanToken(rawToken);
  const { isAuthenticated } = useAuthStore();
  const { fetchMyCouple } = useCouplesStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'needs_auth'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link. Please check the link and try again.');
      return;
    }

    const checkAuth = async () => {
      const authToken = localStorage.getItem('access_token');
      if (!authToken) {
        sessionStorage.setItem('pending_invitation_token', token);
        setStatus('needs_auth');
        setMessage('Please login or register to accept this invitation');
        return;
      }

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

      await axios.post(
        `${API_URL}/api/couples/accept-invitation/${token}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setStatus('success');
      setMessage('Invitation accepted! Couple profile created.');
      sessionStorage.removeItem('pending_invitation_token');
      await fetchMyCouple();

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      const errorMsg = error.response?.data?.detail || 'Failed to accept invitation';
      setMessage(errorMsg);

      if (errorMsg.includes('different email')) {
        setStatus('needs_auth');
        setMessage('This invitation is for a different email. Please register with the correct email address.');
      }

      console.error('Accept invitation error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-25">
        <p className="text-sm text-neutral-500">Processing invitation…</p>
      </div>
    );
  }

  if (status === 'needs_auth') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4">
        <div className="w-full max-w-md">
          <div className="section-shell p-8 text-center">
            <div className="mb-4 text-5xl">📧</div>
            <h1 className="text-2xl font-bold text-neutral-900">You've Been Invited!</h1>
            <p className="mt-3 text-sm text-neutral-600">{message}</p>
            <p className="mt-4 text-xs text-neutral-500">
              If you don't have an account yet, register with the email address that received this invitation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/register?invite=${encodeURIComponent(token || '')}`}
                className="flex-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
              >
                Create Account
              </Link>
              <Link
                href={`/login?invite=${encodeURIComponent(token || '')}`}
                className="flex-1 rounded-xl border-2 border-indigo-600 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-25 px-4">
      <div className="w-full max-w-md">
        <div className="section-shell p-8 text-center">
          {status === 'success' ? (
            <>
              <div className="mb-4 text-5xl text-green-600">✓</div>
              <h1 className="text-2xl font-bold text-neutral-900">Invitation Accepted!</h1>
              <p className="mt-3 text-sm text-neutral-600">{message}</p>
              <p className="mt-4 text-xs text-neutral-500">Redirecting to dashboard…</p>
            </>
          ) : (
            <>
              <div className="mb-4 text-5xl text-red-600">✗</div>
              <h1 className="text-2xl font-bold text-neutral-900">Invitation Failed</h1>
              <p className="mt-3 text-sm text-neutral-600">{message}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="flex-1 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
                >
                  Go to Login
                </Link>
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
