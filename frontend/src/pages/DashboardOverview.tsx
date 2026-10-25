import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Code2,
  Zap,
  Award,
  ArrowRight,
  TrendingUp,
  Brain,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-r from-surface-card via-surface-card to-brand-950/30 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-2">
              <Brain className="h-3.5 w-3.5" />
              DevMind Intelligence Engine Online
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.displayName || 'Engineer'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Role: <span className="capitalize font-semibold text-slate-200">{user?.role}</span>. Ready to run your next system architecture session or test your code against cognitive telemetry?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/dashboard/arena">
              <Button size="sm" className="gap-2 shadow-md shadow-brand-500/20">
                <Code2 className="h-4 w-4" />
                Launch Coding Arena
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="outline" size="sm" className="gap-2">
                Browse Challenges
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border/70 bg-surface-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Completed Challenges</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>+3 this week</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/70 bg-surface-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Cognitive Score</span>
            <Brain className="h-4 w-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white">88<span className="text-sm font-normal text-muted-foreground">/100</span></div>
          <div className="text-[11px] text-brand-300">Top 8% percentile</div>
        </div>

        <div className="p-5 rounded-xl border border-border/70 bg-surface-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">System Architecture Aptitude</span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">92%</div>
          <div className="text-[11px] text-indigo-300">Strong distributed design</div>
        </div>

        <div className="p-5 rounded-xl border border-border/70 bg-surface-card space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Badges</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">5</div>
          <div className="text-[11px] text-amber-300">Concurrency Master</div>
        </div>
      </div>

      {/* Main Grid: Active Challenge and Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Recommended Challenge */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border/70 bg-surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Recommended Assessment
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Medium
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Sliding Window Rate Limiter
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Construct an in-memory Sliding Window Rate Limiter with strict boundary conditions and O(1) amortized queue operations.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-darkest border border-border/60 text-slate-300">
                Category: System Design
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-darkest border border-border/60 text-slate-300">
                Languages: Python, TypeScript
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Estimated time: 45 mins</span>
            <Link to="/dashboard/arena">
              <Button size="sm" className="gap-2">
                Open in Arena
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Competency Snapshot */}
        <div className="p-6 rounded-xl border border-border/70 bg-surface-card space-y-4">
          <h3 className="text-base font-bold text-white">Skill Competency Snapshot</h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Concurrency & Multithreading</span>
                <span className="text-white font-semibold">90%</span>
              </div>
              <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Distributed Systems Design</span>
                <span className="text-white font-semibold">85%</span>
              </div>
              <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Memory Safety & Bounds</span>
                <span className="text-white font-semibold">78%</span>
              </div>
              <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-[78%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Algorithmic Optimization</span>
                <span className="text-white font-semibold">94%</span>
              </div>
              <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
              </div>
            </div>
          </div>

          <Link to="/dashboard/analytics" className="block pt-2">
            <Button variant="ghost" size="sm" className="w-full text-xs text-brand-300 hover:text-white">
              View Detailed SkillGraph
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
