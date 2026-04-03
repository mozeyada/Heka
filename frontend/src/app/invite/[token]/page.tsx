'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, MailOpen, UserRound, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCouplesStore } from '@/store/couplesStore';
import apiClient from '@/lib/api';

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
  const { fetchMyCouple } = useCouplesStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'needs_auth'>('loading');
  const [message, setMessage] = useState('');

  const acceptInvitation = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation token');
      return;
    }

    try {
      const authToken = localStorage.getItem('access_token');
      if (!authToken) {
        setStatus('needs_auth');
        setMessage('Please login first.');
        sessionStorage.setItem('pending_invitation_token', token);
        return;
      }

      await apiClient.post(`/api/couples/accept-invitation/${token}`, {});

      setStatus('success');
      setMessage('Invitation accepted. Your shared workspace is now active.');
      sessionStorage.removeItem('pending_invitation_token');
      await fetchMyCouple();

      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch (error: any) {
      setStatus('error');
      const errorMsg = error.response?.data?.detail || 'Failed to accept invitation';
      setMessage(errorMsg);

      if (errorMsg.includes('different email')) {
        setStatus('needs_auth');
        setMessage('This invitation is tied to a different email. Login or register with the invited address.');
      }
    }
  }, [fetchMyCouple, router, token]);

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
        setMessage('Please login or register to accept this invitation.');
        return;
      }

      acceptInvitation();
    };

    checkAuth();
  }, [acceptInvitation, token]);

  const shellClasses = 'min-h-screen pb-20 text-zinc-300';

  const frame = (content: React.ReactNode) => (
    <div className={shellClasses}>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-teal-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[22%] h-[46vh] w-[46vh] rounded-full bg-indigo-900/18 blur-[155px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[34vh] w-[34vh] rounded-full bg-rose-900/12 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="app-container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-xl">{content}</div>
      </div>
    </div>
  );

  if (status === 'loading') {
    return frame(
      <div className="section-shell p-8 text-center md:p-10">
        <p className="text-sm text-zinc-400">Processing invitation…</p>
      </div>
    );
  }

  if (status === 'needs_auth') {
    return frame(
      <div className="section-shell p-8 text-center md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
          <MailOpen className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">You’ve been invited</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{message}</p>
        <p className="mt-4 text-xs text-zinc-500">
          If you do not have an account yet, register with the email address that received the invitation so the couple link completes cleanly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/register?invite=${encodeURIComponent(token || '')}`}
            className="btn-primary inline-flex flex-1 items-center justify-center gap-2"
          >
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/login?invite=${encodeURIComponent(token || '')}`}
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return frame(
    <div className="section-shell p-8 text-center md:p-10">
      {status === 'success' ? (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">Invitation accepted</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{message}</p>
          <p className="mt-4 text-xs text-zinc-500">Redirecting to your dashboard…</p>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">Invitation failed</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{message}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary inline-flex flex-1 items-center justify-center gap-2">
              <UserRound className="h-4 w-4" />
              Go to Login
            </Link>
            <Link href="/dashboard" className="btn-secondary inline-flex flex-1 items-center justify-center gap-2">
              Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
