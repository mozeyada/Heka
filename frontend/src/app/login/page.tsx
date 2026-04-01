'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const inviteToken = searchParams?.get('invite');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);

      if (inviteToken) {
        const decodedToken = decodeURIComponent(inviteToken);
        sessionStorage.removeItem('pending_invitation_token');
        router.push(`/invite/${decodedToken}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage =
        err.message || err.response?.data?.detail || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 selection:bg-teal-500/30 font-sans text-zinc-300">
      {/* Immersive Space Background */}
      <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] h-[40vh] w-[40vh] rounded-full bg-teal-900/20 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[50vh] w-[50vh] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* The Premium Frost Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
          
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-zinc-400">Sign in to continue your relationship journey</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Logins (Crucial Component Added for Premium SaaS conversion) */}
          <div className="space-y-3 mb-8">
            <button type="button" onClick={() => alert('Social authentication actively provisioning for post-beta.')} className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => alert('Social authentication actively provisioning for post-beta.')} className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
               <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78.78-.04 1.94-.9 3.31-.82 1.16.03 2.15.39 2.84 1.13-2.62 1.54-2.21 5.39.42 6.42-.58 1.48-1.52 3.12-2.66 4.28zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.5-3.74 4.25z"/></svg>
              Continue with Apple
            </button>
          </div>

          <div className="relative mb-8 text-center text-xs text-zinc-600">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative bg-[#050505] px-4">OR CONTINUE WITH EMAIL</span>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="relative">
              <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Email address
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition duration-200"
              />
              {errors.email && <p className="mt-2 text-xs font-semibold text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] font-bold uppercase tracking-wider text-teal-400 hover:text-teal-300 transition">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[2.15rem] inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {errors.password && <p className="mt-2 text-xs font-semibold text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-white hover:text-teal-400 transition">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505]">
          <div className="h-6 w-6 rounded-full border-2 border-zinc-500 border-t-white animate-spin"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
