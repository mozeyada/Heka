'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, HeartHandshake, Lock, MailOpen, Scale, Sparkles, UserRound, XCircle } from 'lucide-react';
import { useCouplesStore } from '@/store/couplesStore';
import apiClient from '@/lib/api';

interface InvitationPreview {
  inviter_name: string;
  invitee_email: string;
  message: string;
  status: string;
  is_expired: boolean;
  privacy_promise: string;
}

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
  const [preview, setPreview] = useState<InvitationPreview | null>(null);

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
        setMessage('Please sign in or create an account to join your shared space.');
        sessionStorage.setItem('pending_invitation_token', token);
        return;
      }

      await apiClient.post(`/api/couples/accept-invitation/${token}`, {});

      setStatus('success');
      setMessage('Invitation accepted! Your private, mediated couple space is now ready.');
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
        setMessage('This invitation is tied to a different email. Please login with the invited address.');
      }
    }
  }, [fetchMyCouple, router, token]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link. Please check the link and try again.');
      return;
    }

    const loadPreviewAndCheckAuth = async () => {
      try {
        const res = await apiClient.get(`/api/couples/invitations/preview/${token}`);
        if (res.data) {
          setPreview(res.data);
        }
      } catch (err) {
        // Fallback preview
        setPreview({
          inviter_name: 'Your partner',
          invitee_email: '',
          message: 'I care about our relationship and want us to have a calm, private space where we both feel heard.',
          status: 'pending',
          is_expired: false,
          privacy_promise: "Your partner will not see your raw unedited writing—only Heka's balanced, neutral mediation summary."
        });
      }

      const authToken = localStorage.getItem('access_token');
      if (!authToken) {
        sessionStorage.setItem('pending_invitation_token', token);
        setStatus('needs_auth');
        return;
      }

      acceptInvitation();
    };

    loadPreviewAndCheckAuth();
  }, [acceptInvitation, token]);

  const shellClasses = 'min-h-screen pb-20 text-zinc-300';

  const frame = (content: React.ReactNode) => (
    <div className={shellClasses}>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-teal-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[22%] h-[46vh] w-[46vh] rounded-full bg-indigo-900/18 blur-[155px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[34vh] w-[34vh] rounded-full bg-rose-900/12 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="app-container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-xl">{content}</div>
      </div>
    </div>
  );

  if (status === 'loading') {
    return frame(
      <div className="section-shell p-8 text-center md:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-400 animate-pulse">
          <HeartHandshake className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm text-zinc-400">Loading invitation preview…</p>
      </div>
    );
  }

  if (status === 'needs_auth') {
    return frame(
      <div className="section-shell p-8 md:p-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-400">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              {preview?.inviter_name || 'Your partner'} invited you
            </h1>
            <p className="text-xs text-zinc-400">Join a private, AI-mediated couple space on Heka</p>
          </div>
        </div>

        {/* Supportive Note */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm leading-relaxed text-zinc-300 italic">
          &ldquo;{preview?.message || 'I care about our relationship and want us to have a calm, private space where we both feel heard.'}&rdquo;
        </div>

        {/* 3 Trust Pillars for Partner B */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-zinc-900/60 p-3">
            <Lock className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">Private Perspectives</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Your partner will never see your raw unedited writing. Heka only shares the balanced, constructive AI summary.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-zinc-900/60 p-3">
            <Scale className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">Strict Impartiality</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Heka never takes sides or blames. Both of your needs and feelings are validated with equal weight.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/register?invite=${encodeURIComponent(token || '')}`}
            className="btn-primary inline-flex flex-1 items-center justify-center gap-2"
          >
            Create Free Account
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
          <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">Welcome to Heka</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{message}</p>
          <p className="mt-4 text-xs text-zinc-500">Redirecting to your dashboard…</p>
        </>
      ) : (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-medium tracking-tight text-white">Invitation Issue</h1>
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
