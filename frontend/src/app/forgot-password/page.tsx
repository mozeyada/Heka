'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api'; // assuming standard axios instance
import { CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      await api.post('/api/auth/forgot-password', { email: data.email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to send reset email. Please try again.'
      );
      console.error('Forgot password error:', err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="section-shell p-8 shadow-xl bg-white/70 backdrop-blur-xl border border-white/60">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-600 shadow-lg" />
            <h1 className="text-2xl font-bold text-neutral-900">Reset Password</h1>
            {!isSubmitted && (
              <p className="mt-2 text-sm text-neutral-500">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900">Check your email</h2>
              <p className="mb-6 text-sm text-neutral-500">
                If an account exists for that email, we have sent password reset instructions.
              </p>
              <Link
                href="/login"
                className="inline-block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Email address
                </label>
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field mt-2 w-full rounded-lg border border-neutral-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                {errors.email && <p className="mt-2 text-xs font-semibold text-red-600">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
              >
                {isSubmitting ? 'Sending Link…' : 'Send Reset Link'}
              </button>

              <p className="mt-6 text-center text-sm text-neutral-500">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
