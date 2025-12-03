'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  MessageCircle,
  Heart,
  Shield,
  ChevronRight,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useArgumentsStore } from '@/store/argumentsStore';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const elevatedCardClasses =
  'border-0 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_24px_45px_rgba(15,23,42,0.12)] transition-all';

const categoryIconMap: Record<
  string,
  { icon: LucideIcon; bg: string; color: string; label: string }
> = {
  communication: {
    icon: MessageCircle,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
    label: 'communication',
  },
  values: {
    icon: Heart,
    bg: 'bg-rose-100',
    color: 'text-rose-600',
    label: 'values alignment',
  },
  trust: {
    icon: Shield,
    bg: 'bg-indigo-100',
    color: 'text-indigo-600',
    label: 'trust & safety',
  },
};

const defaultCategoryIcon = {
  icon: MessageCircle,
  bg: 'bg-slate-200',
  color: 'text-slate-500',
  label: 'relationship',
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return 'Unknown date';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export default function ArgumentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const { arguments: args, fetchArguments, isLoading } = useArgumentsStore();
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const hasRequestedAuth = useRef(false);
  const hasLoadedArguments = useRef(false);

  const loadArguments = async () => {
    try {
      setError(null);
      await fetchArguments();
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to load arguments. Please try again.';
      setError(message);
    } finally {
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user && !hasLoadedArguments.current) {
      hasLoadedArguments.current = true;
      loadArguments();
      return;
    }

    if ((!isAuthenticated || !user) && !hasRequestedAuth.current) {
      hasRequestedAuth.current = true;
      fetchCurrentUser()
        .catch(() => {
          setError('We could not load your profile. Please refresh and try again.');
          setHasInitialized(true);
        })
        .finally(() => {
          hasRequestedAuth.current = false;
        });
    }
  }, [isAuthenticated, user, fetchCurrentUser, router]);

  const handleRefresh = () => {
    setHasInitialized(false);
    loadArguments();
  };

  if (!hasInitialized || isLoading || (!user && isAuthenticated)) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-slate-100/80 min-h-screen pb-32">
      <div className="app-container py-8 space-y-8 pb-28">
        {error && (
          <ErrorAlert
            message={error}
            onRetry={handleRefresh}
            onDismiss={() => setError(null)}
          />
        )}

        <Card className={`${elevatedCardClasses} relative overflow-hidden`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.12),transparent_60%)]" />
          <CardContent className="relative p-8 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                  Active mediation
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Your relationship issues
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Track every conflict in one place, capture perspectives, and guide the conversation
                  toward healthy resolution with AI insights.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 border-0 bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {args.length} logged
                </Badge>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleRefresh} className="gap-2">
                    Refresh
                  </Button>
                  <Button asChild className="gap-2">
                    <Link href="/arguments/create">
                      <PlusCircle className="h-4 w-4" />
                      Log new conflict
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {args.length === 0 ? (
          <Card className={`${elevatedCardClasses} text-center`}>
            <CardContent className="space-y-4 p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <CardTitle>No active issues logged</CardTitle>
                <CardDescription>
                  When conflict arises, capture each partner&apos;s perspective here to start a guided
                  resolution.
                </CardDescription>
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link href="/arguments/create">
                  <PlusCircle className="h-5 w-5" />
                  Start a new session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {args.map((arg) => {
              const { icon: CategoryIcon, bg, color, label } =
                categoryIconMap[arg.category?.toLowerCase() ?? ''] ?? defaultCategoryIcon;

              return (
                <Card key={arg.id} className={`${elevatedCardClasses} relative overflow-hidden`}>
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/80 via-primary/40 to-transparent" />
                  <CardContent className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-6">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} ${color}`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">{arg.title}</h2>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-4 w-4 text-slate-300" />
                          Logged {formatDate(arg.created_at)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge
                          variant="secondary"
                          className="border-0 bg-slate-100 text-slate-600 capitalize"
                        >
                          {arg.status}
                        </Badge>
                        {arg.priority && (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-amber-100 text-amber-600 capitalize"
                          >
                            {arg.priority} priority
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-slate-200 text-slate-500">
                          {label}
                        </Badge>
                      </div>
                      {arg.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{arg.summary}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="self-end gap-1 text-primary hover:text-primary md:self-center"
                      onClick={() => router.push(`/arguments/${arg.id}`)}
                    >
                      View details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

