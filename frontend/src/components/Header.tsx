'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const publicLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/subscription' },
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
];

const authenticatedLinks: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
  { label: 'Goals', href: '/goals', requiresAuth: true },
  { label: 'Check-ins', href: '/checkins/current', requiresAuth: true },
  { label: 'Subscription', href: '/subscription', requiresAuth: true },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchCurrentUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Ensure we have latest user info when layout mounts
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-white/30 sticky top-0 z-40">
      <div className="app-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-brand-gradient shadow-elevated" />
            <span className="font-display text-lg font-semibold tracking-tight text-neutral-900">
              Heka
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-500 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'transition-colors ease-soft-spring hover:text-neutral-900',
                  pathname === link.href ? 'text-neutral-900' : undefined
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="text-sm font-medium text-neutral-600 transition-colors ease-soft-spring hover:text-neutral-900"
              >
                Settings
              </Link>
              <div className="flex items-center gap-3 rounded-full bg-white/70 px-3 py-2 shadow-soft">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm leading-tight">
                  <p className="font-semibold text-neutral-900">{user.name || user.email}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 transition-colors ease-soft-spring hover:bg-neutral-200 hover:text-neutral-900"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-600 transition-colors ease-soft-spring hover:text-neutral-900"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-neutral-600 shadow-soft transition-colors ease-soft-spring hover:bg-neutral-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 6h13M3.5 10h13M3.5 14h13" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/20 bg-white/90 backdrop-blur-md lg:hidden">
          <nav className="app-container flex flex-col gap-2 py-4 text-sm font-semibold text-neutral-600">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'rounded-xl px-4 py-3 transition-colors ease-soft-spring hover:bg-neutral-100 hover:text-neutral-900',
                  pathname === link.href ? 'bg-neutral-100 text-neutral-900' : undefined
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 border-t border-neutral-100 pt-4">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <div className="rounded-xl bg-white px-4 py-3 shadow-soft">
                    <p className="text-sm font-semibold text-neutral-900">{user.name || user.email}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-center text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:bg-neutral-100 hover:text-neutral-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-transform ease-soft-spring hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-center text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:bg-neutral-100 hover:text-neutral-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-brand-gradient px-4 py-2 text-center text-sm font-semibold text-white shadow-elevated transition-transform ease-soft-spring hover:-translate-y-0.5"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
