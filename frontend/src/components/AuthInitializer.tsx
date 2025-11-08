'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthInitializer() {
  const { checkAuth, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('access_token');
    if (token) {
      // Token exists, fetch user data
      fetchCurrentUser();
    } else {
      // No token, mark as not authenticated
      checkAuth();
    }
  }, [checkAuth, fetchCurrentUser]);

  return null; // This component doesn't render anything
}

