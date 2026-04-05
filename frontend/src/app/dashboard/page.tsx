'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
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
  Activity,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { dashboardAPI, getApiErrorMessage } from '@/lib/api';
import { LoadingPage } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [hasCouple, setHasCouple] = useState(false);
  const [args, setArgs] = useState<any[]>([]);
  const [currentCheckin, setCurrentCheckin] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await dashboardAPI.getOverview();
      setHasCouple(true);
      setArgs(Array.isArray(overview.arguments) ? overview.arguments : []);
      setCurrentCheckin(overview.current_checkin ?? null);
      setGoals(Array.isArray(overview.goals) ? overview.goals : []);
      setSubscription(overview.subscription ?? null);
      setUsage(overview.usage ?? null);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasCouple(false);
        setArgs([]);
        setCurrentCheckin(null);
        setGoals([]);
        setSubscription(null);
        setUsage(null);
        setError(null);
        return;
      }
      setError(getApiErrorMessage(error, 'Failed to load dashboard data. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAuthenticated || !user) {
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, user, router, loadDashboardData]);

  const usageCount = usage?.count ?? 0;
  const usageLimit = usage?.limit ?? 0;
  const usagePercentage = usage?.is_unlimited
    ? 0
    : Math.min(Math.round((usageCount / Math.max(usageLimit, 1)) * 100), 100);

  if (!isAuthenticated || !user) return <LoadingPage />;
  if (loading) return <LoadingPage />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const rawUserName = user.name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1).toLowerCase();

  // Premium Ecosystem Constants
  const glassCardClasses = "rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl transition-colors hover:border-white/15";
  
  const categoryIconMap = {
    communication: { icon: MessageCircle, bg: 'bg-teal-500/10', color: 'text-teal-400', text: 'Communication' },
    values: { icon: Heart, bg: 'bg-indigo-500/10', color: 'text-indigo-400', text: 'Values' },
    trust: { icon: Shield, bg: 'bg-purple-500/10', color: 'text-purple-400', text: 'Trust' },
    finances: { icon: Zap, bg: 'bg-amber-500/10', color: 'text-amber-400', text: 'Finances' },
    intimacy: { icon: Heart, bg: 'bg-rose-500/10', color: 'text-rose-400', text: 'Intimacy' },
    family: { icon: Shield, bg: 'bg-green-500/10', color: 'text-green-400', text: 'Family' },
    lifestyle: { icon: Activity, bg: 'bg-cyan-500/10', color: 'text-cyan-400', text: 'Lifestyle' },
    future_plans: { icon: Target, bg: 'bg-violet-500/10', color: 'text-violet-400', text: 'Future Plans' },
    other: { icon: MessageCircle, bg: 'bg-zinc-500/10', color: 'text-zinc-400', text: 'Other' },
  } as const;

  const defaultCategoryIcon = { icon: MessageCircle, bg: 'bg-teal-500/10', color: 'text-teal-400', text: 'Relationship' };
  const getCategoryIconConfig = (category?: string) => {
    const key = (category ?? '').toLowerCase() as keyof typeof categoryIconMap;
    return categoryIconMap[key] ?? defaultCategoryIcon;
  };

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Issues', href: '/arguments', icon: FileText },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  // Relationship Pulse Math (Smart UI)
  const activeIssuesCount = args.filter(a => a.status !== 'resolved').length;
  const isHealthy = activeIssuesCount === 0;
  const issuesNeedingMyResponse = args.filter((a: any) => a.status !== 'resolved' && a.needs_user_response).length;
  const issuesReadyForInsight = args.filter((a: any) => a.status !== 'resolved' && a.can_generate_insight).length;
  const goalsNeedingMyMove = goals.filter((goal: any) => goal.needs_user_progress).length;

  return (
    <div className="min-h-screen text-zinc-300 antialiased font-sans pb-32">
      {/* Immersive Space Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] h-[50vh] w-[50vh] rounded-full bg-teal-900/20 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-indigo-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="app-container py-8 space-y-8 pb-28">
        {error && <ErrorAlert message={error} onRetry={loadDashboardData} onDismiss={() => setError(null)} />}

        {/* Smart Relationship Pulse Component */}
        <div className="flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative flex shrink-0 h-20 w-20 items-center justify-center rounded-full bg-black border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="46" fill="transparent" strokeWidth="6" 
                strokeDasharray="289" strokeDashoffset={isHealthy ? 0 : 70} 
                className={`transition-all duration-1000 ${isHealthy ? 'stroke-teal-500' : 'stroke-orange-500'}`} 
              />
            </svg>
            <Activity className={`z-10 h-8 w-8 ${isHealthy ? 'text-teal-400 animate-pulse' : 'text-orange-400'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white mb-1">
              {getGreeting()}, <span className="text-teal-400">{userName}</span>.
            </h1>
            <p className="text-sm font-medium text-zinc-400">
              {isHealthy
                ? 'Your relationship pulse is stable.'
                : issuesNeedingMyResponse > 0
                  ? `${issuesNeedingMyResponse} issue${issuesNeedingMyResponse === 1 ? '' : 's'} need your response right now.`
                  : issuesReadyForInsight > 0
                    ? `${issuesReadyForInsight} issue${issuesReadyForInsight === 1 ? '' : 's'} are ready for AI mediation.`
                    : 'There are active issues awaiting partner alignment.'}
            </p>
          </div>
        </div>

        {/* SOS Protocol Component */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-teal-500/30 bg-white/[0.03] p-8 shadow-[0_0_50px_rgba(20,184,166,0.05)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-indigo-500/20 blur-2xl opacity-50 z-[-1]" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-[10px] uppercase tracking-widest text-teal-300 font-bold">AI Mediation console</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Resolve a Conflict</h2>
              <p className="text-sm text-zinc-400 max-w-sm">
                Feeling heard is the first step. Start a guided, neutral space mediation session right now.
              </p>
            </div>
            
            <div className="w-full sm:w-auto shrink-0 flex flex-col items-center">
              <button 
                onClick={() => router.push('/arguments/create')} 
                disabled={!hasCouple}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-5 w-5" />
                Start Protocol
              </button>
              {!hasCouple && <span className="mt-3 text-[10px] uppercase tracking-widest text-orange-400">Link Partner Required</span>}
            </div>
          </div>
        </div>

        {/* Dynamic Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          {/* Smart Check-in Telemetry */}
          <div className={`${glassCardClasses} flex flex-col`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Weekly Check-in</h3>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              {currentCheckin?.status === 'completed' ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
                    <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Analysis Complete</span>
                  </div>
                  {currentCheckin.ai_harmony_report ? (
                    <div className="rounded-2xl bg-black/40 border border-white/5 p-5 mt-4 text-sm leading-relaxed text-zinc-300">
                      <div className="border-l-2 border-teal-500 pl-4">
                        {currentCheckin.ai_harmony_report.split('\n\n').map((p: string, i: number) => <p key={i} className="mb-2 last:mb-0">{p}</p>)}
                      </div>
                    </div>
                  ) : (
                     <div className="rounded-2xl bg-black/40 border border-white/5 p-6 mt-4 flex items-center gap-4">
                        <Sparkles className="h-5 w-5 text-zinc-500 animate-pulse" />
                        <p className="text-xs text-zinc-500 font-medium">Synthesizing Harmony Report...</p>
                     </div>
                  )}
                </>
              ) : currentCheckin?.status === 'awaiting_partner' ? (
                <div className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 shrink-0 rounded-full border-2 border-dashed border-orange-500/50 flex items-center justify-center text-orange-400">
                     <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {currentCheckin?.needs_user_response ? 'Your reply is needed' : 'Waiting on partner'}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {currentCheckin?.next_step_description || 'Awaiting your partner\'s responses to generate insights.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-3xl font-light text-white mb-2">—</p>
                  <p className="text-sm font-medium text-zinc-500">
                    {currentCheckin?.next_step_title || 'Pending Alignment Check'}
                  </p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => router.push('/checkins/current')}
              className="mt-8 w-full rounded-xl border border-white/20 bg-white/[0.08] py-3 text-xs font-bold text-white transition hover:bg-white/[0.14] hover:border-white/30"
            >
              {currentCheckin?.status === 'completed' ? 'View Full Telemetry →' : 'Complete Sync →'}
            </button>
          </div>

          {/* Proactive Goals Module */}
          <div className={`${glassCardClasses} flex flex-col`}>
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Growth Objectives</h3>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
                <Target className="h-4 w-4" />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <p className="text-4xl font-medium text-white mb-1">{goals.length}</p>
                <p className="text-xs text-zinc-500">
                  {goalsNeedingMyMove > 0
                    ? `${goalsNeedingMyMove} goal${goalsNeedingMyMove === 1 ? '' : 's'} need your next move.`
                    : 'Active relationship goals being tracked.'}
                </p>
              </div>

              {goals.length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Next shared move</p>
                  <p className="mt-3 text-sm font-medium text-white">{goals[0].next_action_title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{goals[0].next_action_description}</p>
                </div>
              )}

              {/* The "Smart" Proactive Empty State */}
              {goals.length === 0 && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                     <Sparkles className="h-4 w-4 text-indigo-400" />
                     <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">AI PROACTIVE SUGGESTION</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Couples who establish micro-goals resolve conflicts 40% faster. Try setting a goal to dedicate 10 minutes to active listening this week.
                  </p>
                  <Link href="/goals" className="inline-flex text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                    Enable Goal Tracking →
                  </Link>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => router.push('/goals')}
              className="mt-8 w-full rounded-xl border border-white/20 bg-white/[0.08] py-3 text-xs font-bold text-white transition hover:bg-white/[0.14] hover:border-white/30"
            >
               Manage Objectives →
            </button>
          </div>
        </div>

        {/* Active Issues Engine */}
        <div className={`${glassCardClasses} animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Active Mediation Logs</h3>
            {hasCouple && activeIssuesCount > 0 && (
              <Link href="/arguments" className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition">View Archive</Link>
            )}
          </div>

          {activeIssuesCount === 0 ? (
             <div className="rounded-2xl bg-black/20 border border-white/5 p-8 text-center flex flex-col items-center">
                 <Shield className="h-10 w-10 text-emerald-500/50 mb-4" />
                 <p className="text-sm font-medium text-white">No active conflicts detected.</p>
                 <p className="text-xs text-zinc-500 mt-2">Your relationship vector is fundamentally aligned.</p>
             </div>
          ) : (
            <div className="space-y-3">
              {args.filter(a => a.status !== 'resolved').slice(0, 3).map((arg: any) => {
                const { icon: CategoryIcon, bg, color, text } = getCategoryIconConfig(arg.category);
                const stateLabel = arg.needs_user_response
                  ? 'Reply needed'
                  : arg.can_generate_insight
                    ? 'Ready for insight'
                    : arg.insight_status === 'current'
                      ? 'Insight current'
                      : 'Waiting on partner';
                return (
                  <button key={arg.id} onClick={() => router.push(`/arguments/${arg.id}`)} className="w-full flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4 transition-colors hover:bg-white/5 group">
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                       <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color} border border-white/5`}>
                          <CategoryIcon className="h-4 w-4" />
                       </div>
                       <div className="flex flex-col items-start min-w-0">
                          <span className="truncate text-sm font-semibold text-white max-w-[200px] sm:max-w-xs">{arg.title}</span>
                          <span className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{text}</span>
                          <span className={`mt-2 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${
                            arg.needs_user_response
                              ? 'bg-red-500/10 text-red-300'
                              : arg.can_generate_insight
                                ? 'bg-teal-500/10 text-teal-300'
                                : arg.insight_status === 'current'
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : 'bg-orange-500/10 text-orange-300'
                          }`}>
                            {stateLabel}
                          </span>
                       </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-white" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Coupling CTA */}
        {!hasCouple && (
          <div className="relative rounded-3xl border border-orange-500/30 bg-orange-500/10 p-8 backdrop-blur-2xl">
            <h3 className="text-sm font-semibold text-white mb-2">Initialize Partner Sync</h3>
            <p className="text-xs text-orange-200/70 mb-5 max-w-sm">
              The AI Engine requires two perspectives. Connect with your partner to enable collaborative empathy alignment.
            </p>
            <button onClick={() => router.push('/couples/create')} className="rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(249,115,22,0.3)] transition hover:scale-105">
               Link Your Partner
            </button>
          </div>
        )}

      </div>

      {/* Floating Dark Glass Mobile Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <div className="mx-auto flex max-w-sm items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a0a]/80 px-6 py-4 shadow-2xl backdrop-blur-3xl pointer-events-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 transition-transform hover:scale-110">
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-600'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-teal-400' : 'text-zinc-600'}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
