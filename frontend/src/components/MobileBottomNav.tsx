'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, Settings, Target, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const authenticatedNavItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Issues', href: '/arguments', icon: FileText },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Check-ins', href: '/checkins/current', icon: ClipboardCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const hiddenPrefixes = ['/login', '/register', '/forgot-password', '/reset-password'];
const hiddenExactPaths = ['/', '/pricing', '/legal/privacy', '/legal/terms'];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return null;
  }

  if (hiddenExactPaths.includes(pathname) || hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 md:hidden pointer-events-none">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a]/85 px-4 py-3 shadow-2xl backdrop-blur-3xl pointer-events-auto">
        <div className="grid grid-cols-5 gap-1">
          {authenticatedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-transform hover:scale-105"
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-zinc-600'}`} />
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-teal-400' : 'text-zinc-600'
                  }`}
                >
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
