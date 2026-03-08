'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    try {
      setError(null);
      await api.post('/api/auth/reset-password', { 
        token, 
        new_password: data.password 
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to reset password. The link may have expired.'
      );
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-12">
        <div className="w-full max-w-md section-shell p-8 text-center bg-white/70 backdrop-blur-xl border border-white/60">
          <h1 className="text-xl font-bold text-neutral-900 mb-4">Invalid Link</h1>
          <p className="text-sm text-neutral-500 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="section-shell p-8 shadow-xl bg-white/70 backdrop-blur-xl border border-white/60">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-900">Create New Password</h1>
            {!isSuccess && (
              <p className="mt-2 text-sm text-neutral-500">
                Please enter your new password below.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900">Password Reset Complete</h2>
              <p className="mb-6 text-sm text-neutral-500">
                Your password has been successfully updated.
              </p>
              <Link
                href="/login"
                className="inline-block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
              >
                Log In Now
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="password" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  New Password
                </label>
                <input
                  id="password"
                  {...register('password')}
                  type="password"
                  placeholder="Enter new password"
                  className="input-field mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                {errors.password && <p className="mt-2 text-xs font-semibold text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm new password"
                  className="input-field mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                {errors.confirmPassword && <p className="mt-2 text-xs font-semibold text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
              >
                {isSubmitting ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-25">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
