'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCouplesStore } from '@/store/couplesStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { couplesAPI } from '@/lib/api';
import { PageHeading } from '@/components/PageHeading';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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
  const { fetchMyCouple } = useCouplesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);

  useEffect(() => {
    loadPendingInvitations();
  }, []);

  const loadPendingInvitations = async () => {
    try {
      const data = await couplesAPI.getPendingInvitations();
      setPendingInvitations(data.invitations || []);
    } catch (err) {
      // Ignore errors
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CoupleFormData>({
    resolver: zodResolver(coupleSchema),
  });

  const onSubmit = async (data: CoupleFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/api/couples/invite`,
        { partner_email: data.partner_email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      reset();
      await loadPendingInvitations();

      setTimeout(() => {
        fetchMyCouple();
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      const errorDetail = err.response?.data?.detail || 'Failed to send invitation';
      setError(errorDetail);
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await couplesAPI.resendInvitation(invitationId);
      setSuccess(true);
      await loadPendingInvitations();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Failed to resend invitation');
    }
  };

  return (
    <div className="bg-neutral-25 pb-20">
      <PageHeading
        title="Create Couple Profile"
        description="Invite your partner to join Heka and start your relationship journey together."
      />

      <div className="app-container max-w-2xl space-y-8">
        {success && (
          <div className="section-shell border border-green-200 bg-green-50/80 p-5">
            <p className="text-sm font-semibold text-green-600">
              ✓ Invitation sent successfully! Your partner will receive an email with instructions.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-2 text-xs text-green-600">
                Development mode: Check backend logs for the invitation link.
              </p>
            )}
          </div>
        )}

        {pendingInvitations.length > 0 && (
          <div className="section-shell border border-yellow-200 bg-yellow-50/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-700">Pending Invitations</h3>
            <ul className="mt-4 space-y-3">
              {pendingInvitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-yellow-200 bg-white/70 p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800 break-all">
                      {inv.invitee_email}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Sent {new Date(inv.created_at).toLocaleDateString()}
                      {inv.is_expired && <span className="ml-2 font-semibold text-red-600">(Expired)</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResend(inv.id)}
                    disabled={isLoading}
                    className="rounded-lg border border-yellow-300 bg-white px-3 py-1.5 text-xs font-semibold text-yellow-700 transition-colors hover:border-yellow-400 hover:bg-yellow-50 disabled:opacity-50"
                  >
                    Resend
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="section-shell p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Invite Your Partner</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your partner's email. They'll receive a link to join Heka (or create an account if they don't have one yet).
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {error && (
              <div className="section-shell border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="partner_email" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Partner's email address
              </label>
              <input
                id="partner_email"
                {...register('partner_email')}
                type="email"
                placeholder="partner@example.com"
                className="input-field mt-2"
              />
              {errors.partner_email && (
                <p className="mt-2 text-xs font-semibold text-red-600">{errors.partner_email.message}</p>
              )}
              <p className="mt-2 text-xs text-neutral-400">
                An invitation email will be sent to this address with a unique link.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isLoading || success}
                className="btn-primary"
              >
                {isLoading ? 'Sending…' : success ? 'Invitation Sent!' : 'Send Invitation'}
              </button>
              <Link
                href="/dashboard"
                className="btn-secondary inline-flex"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
