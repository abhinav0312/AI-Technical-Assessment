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
  Compass,
  Clock,
  Sparkles,
  GitFork,
} from 'lucide-react';

export function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Developer Workspace Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.displayName || 'Engineer'}
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Track your coding assessments, inspect your ThinkTrace AI feedback, and advance your engineering competencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/dashboard/arena">
              <Button size="sm" className="gap-2 shadow-xs">
                <Code2 className="h-4 w-4" />
                Open Coding Arena
              </Button>
            </Link>
            <Link to="/challenges">
              <Button variant="outline" size="sm" className="gap-2 text-slate-700">
                <Compass className="h-4 w-4 text-brand-600" />
                Browse Problems
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Problems Solved</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">12</div>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>+3 solved this week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cognitive Score</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            88<span className="text-sm font-normal text-slate-500">/100</span>
          </div>
          <div className="text-xs text-brand-600 font-medium">Top 8% percentile</div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">System Architecture</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">92%</div>
          <div className="text-xs text-indigo-600 font-medium">Strong distributed design</div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Badges</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">5</div>
          <div className="text-xs text-amber-600 font-medium">Concurrency Master</div>
        </div>
      </div>

      {/* Main Grid: Active Challenge and Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Recommended Challenge */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Recommended Problem
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Medium
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Sliding Window Rate Limiter
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Construct an in-memory Sliding Window Rate Limiter with strict boundary conditions and O(1) amortized queue operations.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Category: System Design
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Languages: Python, TypeScript
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-brand-700 border border-blue-200">
                ThinkTrace Enabled
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>Estimated time: 45 mins</span>
            </div>
            <Link to="/dashboard/arena">
              <Button size="sm" className="gap-2">
                Open in Arena
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Competency Snapshot */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Skill Competency Snapshot</h3>
            <GitFork className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Concurrency & Multithreading</span>
                <span className="text-slate-900 font-semibold">90%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Distributed Systems Design</span>
                <span className="text-slate-900 font-semibold">85%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Memory Safety & Bounds</span>
                <span className="text-slate-900 font-semibold">78%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[78%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Algorithmic Optimization</span>
                <span className="text-slate-900 font-semibold">94%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[94%]" />
              </div>
            </div>
          </div>

          <Link to="/dashboard/skillgraph" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs text-brand-700 border-brand-200 bg-brand-50 hover:bg-brand-100">
              View Interactive SkillGraph
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
