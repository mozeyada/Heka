'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  MessageCircle,
  Sparkles,
  ChevronRight,
  Heart,
  Shield,
  Home,
  FileText,
  Target,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCouplesStore } from '@/store/couplesStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { checkinsAPI } from '@/lib/api';
import { goalsAPI } from '@/lib/api';
import { subscriptionsAPI } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const { couple, fetchMyCouple } = useCouplesStore();
  const { arguments: args, fetchArguments } = useArgumentsStore();
  const [currentCheckin, setCurrentCheckin] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAuthenticated || !user) {
      fetchCurrentUser();
    }

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, router, fetchCurrentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await fetchMyCouple();
      await fetchArguments();

      if (couple) {
        try {
          const checkin = await checkinsAPI.getCurrent();
          setCurrentCheckin(checkin);
        } catch (error) {
          console.error('Failed to fetch check-in:', error);
        }

        try {
          const goalsData = await goalsAPI.getAll();
          const activeGoals = goalsData.filter((g: any) => g.status === 'active');
          setGoals(activeGoals);
        } catch (error) {
          console.error('Failed to fetch goals:', error);
        }

        try {
          const subData = await subscriptionsAPI.getMySubscription();
          setSubscription(subData);
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
        }

        try {
          const usageData = await subscriptionsAPI.getUsage();
          setUsage(usageData);
        } catch (error) {
          console.error('Failed to fetch usage:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const usageCount = usage?.usage_count ?? 0;
  const usageLimit = usage?.limit ?? 0;
  const usagePercentage = usage?.is_unlimited
    ? 0
    : Math.min(Math.round((usageCount / Math.max(usageLimit, 1)) * 100), 100);
  const trialEndsOn = subscription?.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : null;

  if (!isAuthenticated || !user) {
    return <LoadingPage />;
  }

  if (loading) {
    return <LoadingPage />;
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';
  const userInitial = userName.charAt(0).toUpperCase();
  const elevatedCardClasses =
    'border-0 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_45px_rgba(15,23,42,0.12)] transition-all';
  const categoryIconMap = {
    communication: {
      icon: MessageCircle,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
      text: 'communication',
    },
    values: {
      icon: Heart,
      bg: 'bg-rose-100',
      color: 'text-rose-600',
      text: 'values alignment',
    },
    trust: {
      icon: Shield,
      bg: 'bg-indigo-100',
      color: 'text-indigo-600',
      text: 'trust & safety',
    },
  } as const;
  const defaultCategoryIcon = {
    icon: MessageCircle,
    bg: 'bg-slate-200',
    color: 'text-slate-500',
    text: 'relationship',
  };
  const getCategoryIconConfig = (category?: string) => {
    const key = (category ?? '').toLowerCase() as keyof typeof categoryIconMap;
    return categoryIconMap[key] ?? defaultCategoryIcon;
  };
  const navItems: Array<{ label: string; href: string; icon: LucideIcon }> = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Issues', href: '/arguments', icon: FileText },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="bg-slate-100/80 min-h-screen pb-32">
      <div className="app-container py-8 space-y-6 pb-28">
        {error && (
          <ErrorAlert message={error} onRetry={loadDashboardData} onDismiss={() => setError(null)} />
        )}

        {/* Hero Section - Warm Greeting */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {getGreeting()}, {userName}.
            </h1>
            <p className="text-base font-medium text-slate-500">Your relationship pulse.</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white shadow-lg border border-white flex items-center justify-center text-primary font-semibold">
            {userInitial}
          </div>
        </div>

        {/* Primary Action Card - Start New Session */}
        <Card
          className={`${elevatedCardClasses} relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-white`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,51,234,0.2),transparent_50%)]" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Resolve a Conflict
                </h2>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  Feeling heard is the first step. Start a guided AI mediation session now.
                </p>
              </div>
              {/* Decorative Icon */}
              <div className="p-2 bg-primary/10 rounded-full ml-4">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Button
              className="w-full mt-6 gap-2 shadow-md"
              size="lg"
              onClick={() => router.push('/arguments/create')}
              disabled={!couple}
            >
              <MessageCircle className="h-4 w-4" />
              Start New Session
            </Button>
            {!couple && (
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Connect with your partner to start
              </p>
            )}
          </CardContent>
        </Card>

        {/* Status Grid - 2 Columns (Fixed Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* Weekly Check-in Card */}
          <Card className={`${elevatedCardClasses} h-full flex flex-col`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Weekly Check-in
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  {currentCheckin?.status === 'completed' ? (
                    <Sparkles className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-slate-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {currentCheckin?.status === 'completed' ? (
                  <>
                    <p className="text-4xl font-bold text-slate-900">✓</p>
                    <p className="mt-1 text-sm text-emerald-600 font-medium">Completed</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-slate-900">—</p>
                    <p className="mt-1 text-sm text-amber-600 font-medium">Pending</p>
                  </>
                )}
              </div>
              <Button
                className="w-full bg-secondary/60 hover:bg-secondary text-secondary-foreground border-0 shadow-sm"
                size="sm"
                asChild
              >
                <Link href="/checkins/current">
                  {currentCheckin?.status === 'completed' ? 'View' : 'Complete Now'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active Goals Card */}
          <Card className={`${elevatedCardClasses} h-full flex flex-col`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Active Goals
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-5xl font-bold text-primary leading-none">{goals.length}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {goals.length === 1 ? 'Goal' : 'Goals'}
                </p>
              </div>
              <Button
                className="w-full bg-secondary/60 hover:bg-secondary text-secondary-foreground border-0 shadow-sm"
                size="sm"
                asChild
              >
                <Link href="/goals">View Goals</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Issues / Recent Arguments */}
        <Card className={elevatedCardClasses}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Issues</CardTitle>
              {couple && args.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/arguments">View All</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {args.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No active conflicts. You're in a good place.
                </p>
                {couple && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/arguments/create')}
                  >
                    Start New Session
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {args.slice(0, 3).map((arg) => {
                  const { icon: CategoryIcon, bg, color, text } = getCategoryIconConfig(arg.category);
                  return (
                    <button
                      key={arg.id}
                      onClick={() => router.push(`/arguments/${arg.id}`)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors hover:bg-slate-50 group"
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate pr-4">{arg.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 h-5 font-medium bg-slate-100 text-slate-500 border-0"
                          >
                            {arg.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize truncate">
                            {text}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Couple Status */}
        {!couple && (
          <Card className={`${elevatedCardClasses} bg-primary/5`}>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Connect with Your Partner</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Invite your partner to unlock shared insights and collaborative mediation.
              </p>
              <Button
                size="sm"
                onClick={() => router.push('/couples/create')}
              >
                Create Couple Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription/Usage - Subtle Bottom Section */}
        {subscription && !usage?.is_unlimited && usageLimit > 0 && (
          <Card className={elevatedCardClasses}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plan Status</p>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/subscription">View Options</Link>
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {usageCount} of {usageLimit} free sessions used
                  </span>
                  <span className="text-muted-foreground">{usagePercentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usageCount >= usageLimit ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                {subscription.tier === 'free' && trialEndsOn && (
                  <p className="text-xs text-muted-foreground">
                    Trial ends {trialEndsOn}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-lg shadow-[0_-4px_12px_rgba(15,23,42,0.12)]">
        <div className="app-container">
          <div className="flex items-center justify-between py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1 text-xs font-medium"
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span className={isActive ? 'text-primary' : 'text-slate-500'}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
