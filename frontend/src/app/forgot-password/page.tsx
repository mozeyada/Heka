'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Mail, ShieldAlert } from 'lucide-react';
import api from '@/lib/api';

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
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    }
  };

  return (
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
                Account Recovery
              </div>
              <Link href="/login" className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-medium tracking-tight text-white">Reset your password</h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Enter the email on your account and Heka will send a secure recovery link. Security and recovery emails stay enabled because they protect access to your account.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-[1.4rem] border border-red-500/20 bg-red-500/[0.06] p-4">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            )}

            {isSubmitted ? (
              <div className="mt-8 rounded-[1.8rem] border border-emerald-500/20 bg-emerald-500/[0.06] p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-white">Check your email</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  If that account exists, a reset link has been sent. You can return to login now, or keep this page open while you open the email.
                </p>
                <Link href="/login" className="btn-primary mt-6 inline-flex items-center justify-center gap-2">
                  Return to Login
                </Link>
              </div>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Email address
                  </label>
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="input-field mt-3"
                  />
                  {errors.email && <p className="mt-2 text-xs font-semibold text-red-300">{errors.email.message}</p>}
                </div>

                <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
                  <p className="text-sm text-zinc-400">
                    Use the same address you registered with. If the account exists, the recovery email will include a single-use reset link.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending Link…' : 'Send Reset Link'}
                </button>

                <p className="text-center text-sm text-zinc-500">
                  Remembered your password?{' '}
                  <Link href="/login" className="font-semibold text-teal-300 hover:text-teal-200">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
