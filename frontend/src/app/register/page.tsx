'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(16, 'Must be 16 years or older').max(120),
  accept_terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms of Service to register',
  }),
  accept_privacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the Privacy Policy to register',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get('invite') || sessionStorage.getItem('pending_invitation_token');
  const { register: registerUser, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data);
      // Success - redirect based on invitation
      if (inviteToken) {
        // Decode the token if it was encoded
        const decodedToken = decodeURIComponent(inviteToken);
        // Clear pending invitation token
        sessionStorage.removeItem('pending_invitation_token');
        router.push(`/invite/${decodedToken}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      // Show proper error message
      const errorMessage = err.message || err.response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 px-4">
            Start resolving arguments together with AI mediation
          </p>
          {inviteToken && (
            <p className="mt-2 text-center text-xs sm:text-sm text-blue-600 px-4">
              You've been invited! Create your account to accept.
            </p>
          )}
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6 bg-white shadow rounded-lg p-6 sm:p-8" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                {...register('age', { valueAsNumber: true })}
                type="number"
                min="16"
                max="120"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Must be 16 years or older</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Legal Acceptance */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-start">
                <input
                  {...register('accept_terms')}
                  type="checkbox"
                  id="accept_terms"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="accept_terms" className="ml-2 text-sm text-gray-700">
                  I accept the{' '}
                  <a href="/legal/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                  {' '}*
                </label>
              </div>
              {errors.accept_terms && (
                <p className="text-sm text-red-600 ml-6">{errors.accept_terms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  {...register('accept_privacy')}
                  type="checkbox"
                  id="accept_privacy"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="accept_privacy" className="ml-2 text-sm text-gray-700">
                  I accept the{' '}
                  <a href="/legal/privacy" target="_blank" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  {' '}*
                </label>
              </div>
              {errors.accept_privacy && (
                <p className="text-sm text-red-600 ml-6">{errors.accept_privacy.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

