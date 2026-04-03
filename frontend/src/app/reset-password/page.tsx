'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

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
  path: ['confirmPassword'],
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
        new_password: data.password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    }
  };

  const shell = (
    <div className="min-h-screen pb-20 text-zinc-300">
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute left-[-12%] top-[10%] h-[42vh] w-[42vh] rounded-full bg-teal-900/18 blur-[140px]" />
        <div className="absolute right-[-10%] top-[22%] h-[46vh] w-[46vh] rounded-full bg-indigo-900/18 blur-[155px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[34vh] w-[34vh] rounded-full bg-rose-900/12 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="app-container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-xl">
          <div className="section-shell p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                Secure Reset
              </div>
              <Link href="/login" className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>

            {!token && !isSuccess ? (
              <div className="mt-8 rounded-[1.8rem] border border-red-500/20 bg-red-500/[0.06] p-6 text-center">
                <h1 className="text-2xl font-semibold text-white">Invalid link</h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  This password reset link is invalid or expired. Request a new link and use the latest email.
                </p>
                <Link href="/forgot-password" className="btn-primary mt-6 inline-flex items-center justify-center gap-2">
                  Request New Link
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-medium tracking-tight text-white">Create a new password</h1>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                      Set a fresh password for your Heka account. Recovery links are single-use and expire quickly for security.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 rounded-[1.4rem] border border-red-500/20 bg-red-500/[0.06] p-4">
                    <p className="text-sm font-medium text-red-200">{error}</p>
                  </div>
                )}

                {isSuccess ? (
                  <div className="mt-8 rounded-[1.8rem] border border-emerald-500/20 bg-emerald-500/[0.06] p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-white">Password reset complete</h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      Your account now uses the new password. Continue to login and re-enter Heka normally.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="btn-primary mt-6 inline-flex items-center justify-center gap-2"
                    >
                      Log In Now
                    </button>
                  </div>
                ) : (
                  <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                      <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                        New password
                      </label>
                      <input
                        id="password"
                        {...register('password')}
                        type="password"
                        placeholder="Enter new password"
                        className="input-field mt-3"
                      />
                      {errors.password && <p className="mt-2 text-xs font-semibold text-red-300">{errors.password.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="Confirm new password"
                        className="input-field mt-3"
                      />
                      {errors.confirmPassword && <p className="mt-2 text-xs font-semibold text-red-300">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Resetting…' : 'Reset Password'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return shell;
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
