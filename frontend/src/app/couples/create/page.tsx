'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCouplesStore } from '@/store/couplesStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Link2,
  Mail,
  RefreshCcw,
  SendHorizontal,
  Sparkles,
  TimerReset,
  Users,
} from 'lucide-react';
import { couplesAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';
import { ErrorAlert, SuccessAlert } from '@/components/ErrorAlert';
import { useAuthStore } from '@/store/authStore';

const coupleSchema = z.object({
  partner_email: z.string().email('Invalid email address'),
});

type CoupleFormData = z.infer<typeof coupleSchema>;

interface PendingInvitation {
  id: string;
  invitee_email: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export default function CreateCouplePage() {
  const router = useRouter();
  const { fetchMyCouple, couple } = useCouplesStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);

  const loadPendingInvitations = useCallback(async () => {
    try {
      const data = await couplesAPI.getPendingInvitations();
      setPendingInvitations(data.invitations || []);
    } catch {
      // Ignore invitation loading failures on this screen.
    }
  }, []);

  useEffect(() => {
    fetchMyCouple().catch(() => {});
    loadPendingInvitations();
  }, [fetchMyCouple, loadPendingInvitations]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CoupleFormData>({
    resolver: zodResolver(coupleSchema),
  });

  const onSubmit = async (data: CoupleFormData) => {
    if (user && data.partner_email.toLowerCase() === user.email.toLowerCase()) {
      setError("Use your partner's email address, not your own.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await couplesAPI.create(data.partner_email);

      setSuccessMessage(
        response.delivery_status === 'pending_retry'
          ? 'Invitation was created, but email delivery could not be confirmed. Your partner link is saved below in pending invitations, and you can resend once mail delivery is healthy.'
          : 'Invitation sent successfully. Your partner will receive a join link by email. Once they accept, the shared relationship workspace activates automatically.'
      );
      reset();
      await loadPendingInvitations();

      setTimeout(() => {
        fetchMyCouple();
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Failed to send invitation');
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await couplesAPI.resendInvitation(invitationId);
      setSuccessMessage(
        response.delivery_status === 'pending_retry'
          ? 'The invitation is still active, but email delivery could not be confirmed. You can retry once the mail service is healthy.'
          : 'Invitation resent successfully.'
      );
      await loadPendingInvitations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen pb-28 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-teal-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[20%] h-[46vh] w-[46vh] rounded-full bg-indigo-900/16 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[26%] h-[34vh] w-[34vh] rounded-full bg-cyan-900/10 blur-[125px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <PageHeading
        title="Link Your Partner"
        description="Heka becomes most useful when both sides are present. Send one clean invite and unlock the shared mediation flow."
        actions={
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      <div className="app-container max-w-5xl space-y-8">
        {successMessage && (
          <SuccessAlert
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {couple && (
          <div className="section-shell border border-emerald-500/20 bg-emerald-500/[0.06] p-7 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                  <Users className="h-3.5 w-3.5" />
                  Partner linked
                </div>
                <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">Your shared workspace is already active</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300/85">
                  You already have an active couple profile, so this onboarding gate is complete. The next useful actions live in dashboard, issues, goals, and weekly sync.
                </p>
              </div>
              <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {!couple && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="section-shell p-7 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Why this matters</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-white">Two perspectives unlock the engine</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Arguments, check-ins, goals, and insights all get better once both partners are inside the same shared space.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Invite by email</p>
                    <p className="text-sm text-zinc-500">One partner sends a direct invitation with a unique link.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Shared flow activates</p>
                    <p className="text-sm text-zinc-500">After acceptance, both partners can use mediation, goals, and weekly sync.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
                    <TimerReset className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Invitation stays active for 7 days</p>
                    <p className="text-sm text-zinc-500">You can track pending invites below and resend if your partner misses the first email.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-shell p-7 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Invitation flow
            </div>
            <h2 className="mt-5 text-3xl font-medium tracking-tight text-white">Invite your partner</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Enter their email and Heka will send a join link. If they do not have an account yet, the invite will guide them through setup first.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Step 1</p>
                <p className="mt-2 text-sm font-semibold text-white">Send invite</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Step 2</p>
                <p className="mt-2 text-sm font-semibold text-white">Partner accepts</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Step 3</p>
                <p className="mt-2 text-sm font-semibold text-white">Shared tools unlock</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div>
                <label htmlFor="partner_email" className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Partner email
                </label>
                <input
                  id="partner_email"
                  {...register('partner_email')}
                  type="email"
                  placeholder="partner@example.com"
                  className="input-field mt-3"
                />
                {errors.partner_email && (
                  <p className="mt-2 text-xs font-semibold text-red-300">{errors.partner_email.message}</p>
                )}
                <p className="mt-3 text-xs text-zinc-500">
                  The invitation link is tied to this email and will appear in pending invitations below until accepted or expired.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <SendHorizontal className="h-4 w-4" />
                  {isLoading ? 'Sending…' : successMessage ? 'Invitation Sent!' : 'Send Invitation'}
                </button>
                <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
        )}

        {pendingInvitations.length > 0 && (
          <div className="section-shell p-7 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Pending invitations</p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-white">Outstanding partner requests</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-500">
                Resend available for inactive invites
              </div>
            </div>

            <ul className="mt-7 space-y-4">
              {pendingInvitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-black/25 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-semibold text-white">{inv.invitee_email}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Sent {new Date(inv.created_at).toLocaleDateString()}
                      {inv.is_expired ? (
                        <span className="ml-2 font-semibold text-red-300">(Expired)</span>
                      ) : (
                        <span className="ml-2 font-semibold text-zinc-400">
                          • Expires in {getDaysUntilExpiry(inv.expires_at)} day{getDaysUntilExpiry(inv.expires_at) === 1 ? '' : 's'}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResend(inv.id)}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Resend
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
