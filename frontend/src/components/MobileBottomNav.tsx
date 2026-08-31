'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, Settings, Target, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const authenticatedNavItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Talk', href: '/arguments', icon: FileText },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Check-in', href: '/checkins/current', icon: ClipboardCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const hiddenPrefixes = ['/login', '/register', '/forgot-password', '/reset-password'];
const hiddenExactPaths = ['/', '/pricing', '/legal/privacy', '/legal/terms'];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) return null;
  if (hiddenExactPaths.includes(pathname) || hiddenPrefixes.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 md:hidden pointer-events-none">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a]/90 px-2 py-2 shadow-2xl backdrop-blur-3xl pointer-events-auto">
        <div className="grid grid-cols-5 gap-1">
          {authenticatedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-teal-500/20 ring-1 ring-teal-400/30'
                    : 'bg-transparent'
                }`}>
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-600'}`} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-teal-400' : 'text-zinc-600'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
