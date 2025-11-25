'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="app-container py-8 space-y-6">
        {error && (
          <ErrorAlert message={error} onRetry={loadDashboardData} onDismiss={() => setError(null)} />
        )}

        {/* Hero Section - Warm Greeting */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {getGreeting()}, {userName}.
          </h1>
          <p className="text-sm text-neutral-500">Your relationship pulse.</p>
        </div>

        {/* Primary Action Card - Start New Session */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
          <CardContent className="p-6">
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
        <div className="grid grid-cols-2 gap-4">
          {/* Weekly Check-in Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Weekly Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                {currentCheckin?.status === 'completed' ? (
                  <>
                    <p className="text-3xl font-semibold text-foreground">✓</p>
                    <p className="mt-1 text-xs text-muted-foreground">Completed</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-semibold text-foreground">—</p>
                    <p className="mt-1 text-xs text-muted-foreground">Pending</p>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href="/checkins/current">
                  {currentCheckin?.status === 'completed' ? 'View' : 'Complete Now'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active Goals Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-3xl font-semibold text-foreground">{goals.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {goals.length === 1 ? 'Goal' : 'Goals'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href="/goals">View Goals</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Issues / Recent Arguments */}
        <Card>
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
              <div className="space-y-2">
                {args.slice(0, 3).map((arg) => (
                  <button
                    key={arg.id}
                    onClick={() => router.push(`/arguments/${arg.id}`)}
                    className="w-full rounded-lg border border-border bg-muted/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-background flex items-center justify-between group"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-semibold text-foreground truncate mb-1">{arg.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            arg.status === 'analyzed'
                              ? 'default'
                              : arg.status === 'draft'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {arg.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {arg.category}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Couple Status */}
        {!couple && (
          <Card className="border-primary/20 bg-primary/5">
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
          <Card>
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
    </div>
  );
}
