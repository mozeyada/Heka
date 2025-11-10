'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.coerce.number().min(16, 'You must be at least 16 years old').max(120, 'Invalid age'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accept_terms: z.boolean().refine((val) => val === true, 'You must accept the Terms of Service'),
  accept_privacy: z.boolean().refine((val) => val === true, 'You must accept the Privacy Policy'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const inviteToken = searchParams?.get('invite');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data);

      if (inviteToken) {
        const decodedToken = decodeURIComponent(inviteToken);
        sessionStorage.removeItem('pending_invitation_token');
        router.push(`/invite/${decodedToken}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage =
        err.message || err.response?.data?.detail || 'Registration failed. Please check your information and try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="section-shell p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-pink-600 shadow-lg" />
            <h1 className="text-2xl font-bold text-neutral-900">Join Heka</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Start resolving conflicts with empathy and AI guidance.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">Registration Failed</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Name
                </label>
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="input-field mt-2"
                />
                {errors.name && <p className="mt-2 text-xs font-semibold text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="age" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Age
                </label>
                <input
                  id="age"
                  {...register('age')}
                  type="number"
                  placeholder="16+"
                  className="input-field mt-2"
                />
                {errors.age && <p className="mt-2 text-xs font-semibold text-red-600">{errors.age.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Email address
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field mt-2"
              />
              {errors.email && <p className="mt-2 text-xs font-semibold text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Password
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="input-field mt-2"
              />
              {errors.password && <p className="mt-2 text-xs font-semibold text-red-600">{errors.password.message}</p>}
              <p className="mt-2 text-xs text-neutral-400">
                Must include uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-200 pt-5">
              <p className="text-xs text-neutral-500">By creating an account, you agree to our terms and privacy policy.</p>
              <div className="flex items-start gap-2">
                <input
                  {...register('accept_terms')}
                  type="checkbox"
                  id="accept_terms"
                  required
                  className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="accept_terms" className="text-sm text-neutral-700">
                  I agree to the{' '}
                  <a
                    href="/legal/terms"
                    target="_blank"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Terms of Service
                  </a>
                </label>
              </div>
              {errors.accept_terms && (
                <p className="ml-6 text-xs font-semibold text-red-600">{errors.accept_terms.message}</p>
              )}

              <div className="flex items-start gap-2">
                <input
                  {...register('accept_privacy')}
                  type="checkbox"
                  id="accept_privacy"
                  required
                  className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="accept_privacy" className="text-sm text-neutral-700">
                  I agree to the{' '}
                  <a
                    href="/legal/privacy"
                    target="_blank"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.accept_privacy && (
                <p className="ml-6 text-xs font-semibold text-red-600">{errors.accept_privacy.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-25">
          <p className="text-sm text-neutral-500">Loading…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
