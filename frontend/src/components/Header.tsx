'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown, Settings as SettingsIcon, CreditCard, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';

interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

const publicLinks: NavLink[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
];

const authenticatedLinks: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
  { label: 'Conversations', href: '/arguments', requiresAuth: true },
  { label: 'Goals', href: '/goals', requiresAuth: true },
  { label: 'Check-ins', href: '/checkins/current', requiresAuth: true },
];

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchCurrentUser } = useAuthStore();
  const { unreadCount, fetchUnreadCount, clearNotifications } = useNotificationsStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && !user) fetchCurrentUser();
  }, [isAuthenticated, user, fetchCurrentUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearNotifications();
      return;
    }
    const refreshUnreadCount = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount(true);
    };
    fetchUnreadCount();
    window.addEventListener('focus', refreshUnreadCount);
    document.addEventListener('visibilitychange', refreshUnreadCount);
    return () => {
      window.removeEventListener('focus', refreshUnreadCount);
      document.removeEventListener('visibilitychange', refreshUnreadCount);
    };
  }, [isAuthenticated, fetchUnreadCount, clearNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <header className="border-b sticky top-0 z-[100] bg-black/40 backdrop-blur-2xl border-white/5">
      <div className="app-container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/heka-logo.jpg"
              alt="Heka"
              width={32}
              height={32}
              className="rounded-lg object-cover ring-1 ring-white/10 transition group-hover:ring-teal-400/50"
              priority
            />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Heka<span className="text-teal-400">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'transition-colors',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
                    {(user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user.name?.split(' ')[0] ?? user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                      <p className="text-xs font-semibold text-white truncate">{user.name ?? user.email}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/settings" onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white">
                      <SettingsIcon className="h-3.5 w-3.5" /> Settings
                    </Link>
                    <Link href="/subscription" onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white">
                      <CreditCard className="h-3.5 w-3.5" /> Plan & Billing
                    </Link>
                    <button type="button" onClick={() => { handleLogout(); setAccountMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300">
                      <LogOut className="h-3.5 w-3.5" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white">
                Log In
              </Link>
              <Link href="/register"
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:scale-[1.02]">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M6 14L14 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 6h13M3.5 10h13M3.5 14h13" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl lg:hidden">
          <nav className="app-container flex flex-col gap-2 py-4 text-sm font-semibold text-zinc-300">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={classNames(
                  'rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.06] hover:text-white',
                  pathname === link.href ? 'bg-white/[0.08] text-white' : undefined
                )}
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <Link href="/notifications"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    onClick={() => setMobileOpen(false)}>
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-300">
                      {(user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name ?? user.email}</p>
                      {user.name && <p className="text-xs text-zinc-400 truncate">{user.email}</p>}
                    </div>
                  </div>
                  <Link href="/settings" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                    <SettingsIcon className="h-4 w-4" /> Settings
                  </Link>
                  <Link href="/subscription" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                    <CreditCard className="h-4 w-4" /> Plan & Billing
                  </Link>
                  <button type="button" onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-red-500/10 hover:text-red-300">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-center text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                    Log In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-black transition hover:scale-[1.02]">
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
