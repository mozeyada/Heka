'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Settings as SettingsIcon, CreditCard, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

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
  { label: 'Issues', href: '/arguments', requiresAuth: true },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we have latest user info when layout mounts
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, user, fetchCurrentUser]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const links = isAuthenticated ? authenticatedLinks : publicLinks;
  const isMarketingPage = true; // Globally enforced Dark Mode ecosystem

  return (
    <header className={classNames(
      "border-b sticky top-0 z-40 transition-colors duration-300",
      isMarketingPage 
        ? "bg-black/20 backdrop-blur-xl border-white/5" 
        : "bg-surface/80 backdrop-blur-md border-white/30"
    )}>
      <div className="app-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            {!isMarketingPage && <div className="h-9 w-9 rounded-xl bg-brand-gradient shadow-elevated" />}
            <span className={classNames(
              "font-display text-xl font-bold tracking-tight",
              isMarketingPage ? "text-white" : "text-neutral-900"
            )}>
              Heka{isMarketingPage && <span className="text-teal-500">.</span>}
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'transition-colors ease-soft-spring',
                  isMarketingPage
                    ? pathname === link.href ? 'text-white' : 'text-zinc-400 hover:text-white'
                    : pathname === link.href ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex select-none items-center gap-2 rounded-full border border-neutral-200 bg-white py-1.5 pl-2 pr-3 shadow-sm hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {(() => {
                    const rawName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? '?';
                    return rawName.charAt(0).toUpperCase();
                  })()}
                </div>
                <span className="text-xs font-semibold text-neutral-700">
                  {user.name?.split(' ')[0] ?? user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-2xl border border-white/10 bg-zinc-950/94 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                  <div className="space-y-1">
                    <div className="mb-2 border-b border-white/10 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name || 'User Account'}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <SettingsIcon className="h-4 w-4 text-zinc-500" />
                      Account Settings
                    </Link>
                    
                    <Link
                      href="/subscription"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <CreditCard className="h-4 w-4 text-zinc-500" />
                      Plan & Billing
                    </Link>
                    
                    <div className="mx-2 my-1 h-px bg-white/10" />
                    
                    <button
                      type="button"
                      aria-label="Log out"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <LogOut className="h-4 w-4 text-rose-400" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className={classNames(
                  "text-sm font-medium transition-colors ease-soft-spring",
                  isMarketingPage ? "text-white hover:text-teal-400" : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className={classNames(
                  "rounded-xl px-6 py-2.5 text-sm font-semibold transition-transform ease-soft-spring hover:-translate-y-0.5",
                  isMarketingPage 
                    ? "bg-white text-black hover:scale-[1.02]" 
                    : "bg-brand-gradient text-white shadow-elevated"
                )}
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
                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-soft">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {(() => {
                        const rawName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? '?';
                        return rawName.charAt(0).toUpperCase();
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const rawName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? null;
                        const displayName = rawName
                          ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
                          : null;
                        return (
                          <>
                            <p className="text-sm font-semibold text-neutral-900 truncate">
                              {displayName || user.email}
                            </p>
                            {displayName && (
                              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <Link
                      href="/settings"
                      className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:bg-neutral-100 hover:text-neutral-900"
                      onClick={() => setMobileOpen(false)}
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Account Settings
                  </Link>
                  <Link
                      href="/subscription"
                      className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors ease-soft-spring hover:bg-neutral-100 hover:text-neutral-900"
                      onClick={() => setMobileOpen(false)}
                    >
                      <CreditCard className="h-4 w-4" />
                      Plan & Billing
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
