'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCouplesStore } from '@/store/couplesStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { couplesAPI } from '@/lib/api';

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
      const response = await axios.post(
        `${API_URL}/api/couples/invite`,
        { partner_email: data.partner_email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setSuccess(true);
      reset();
      await loadPendingInvitations();
      
      // Refresh couple status
      setTimeout(() => {
        fetchMyCouple();
        router.push('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      setIsLoading(false);
      const errorDetail = err.response?.data?.detail || 'Failed to send invitation';
      
      // If invitation already exists, offer to resend
      if (errorDetail.includes('already sent')) {
        setError(`${errorDetail} Check your email inbox or contact support if you didn't receive it.`);
      } else {
        setError(errorDetail);
      }
    }
  };

  const handleResend = async (invitationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await couplesAPI.resendInvitation(invitationId);
      setSuccess(true);
      await loadPendingInvitations();
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.detail || 'Failed to resend invitation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Heka</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Create Couple Profile</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Invite your partner to join Heka. They'll receive an email invitation. 
            If they don't have an account yet, they can create one when they click the invitation link.
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6 text-xs sm:text-sm">
              ✓ Invitation sent successfully! Your partner will receive an email with instructions.
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-2 text-xs">Note: In development mode, check backend console logs for the invitation link.</p>
              )}
            </div>
          )}

          {pendingInvitations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-yellow-900 mb-2">Pending Invitations:</h3>
              <ul className="space-y-2">
                {pendingInvitations.map((inv) => (
                  <li key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-gray-700 break-all">
                      {inv.invitee_email}
                      {inv.is_expired && <span className="text-red-600 ml-2">(Expired)</span>}
                    </span>
                    <button
                      onClick={() => handleResend(inv.id)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50 whitespace-nowrap"
                    >
                      Resend
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="partner_email" className="block text-sm font-medium text-gray-700">
                Partner's Email
              </label>
              <input
                {...register('partner_email')}
                type="email"
                placeholder="partner@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
              {errors.partner_email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.partner_email.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                An invitation email will be sent to this address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={isLoading || success}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? 'Sending...' : success ? 'Invitation Sent!' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
