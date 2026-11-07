import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import {
  BugHunterChallengeSummary,
  BugHunterStreak,
} from '@/types/bughunter';
import {
  Bug,
  Flame,
  Award,
  Sparkles,
  ChevronRight,
  Filter,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BugHunterPage() {
  const [challenges, setChallenges] = useState<BugHunterChallengeSummary[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<BugHunterChallengeSummary | null>(null);
  const [streak, setStreak] = useState<BugHunterStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const fetchBugHunterData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [challengesRes, dailyRes, streakRes] = await Promise.allSettled([
        apiClient<BugHunterChallengeSummary[]>('/bughunter/challenges'),
        apiClient<BugHunterChallengeSummary>('/bughunter/daily'),
        apiClient<BugHunterStreak>('/bughunter/streak'),
      ]);

      if (challengesRes.status === 'fulfilled') {
        setChallenges(challengesRes.value || []);
      }
      if (dailyRes.status === 'fulfilled') {
        setDailyChallenge(dailyRes.value);
      }
      if (streakRes.status === 'fulfilled') {
        setStreak(streakRes.value);
      }
    } catch (err) {
      console.error('Failed to load BugHunter catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBugHunterData();
  }, [fetchBugHunterData]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'boundary_condition', label: 'Boundary Conditions' },
    { id: 'logical_error', label: 'Logical Errors' },
    { id: 'runtime_error', label: 'Runtime Errors' },
    { id: 'algorithmic_inefficiency', label: 'Inefficiency' },
    { id: 'sql_error', label: 'SQL Errors' },
    { id: 'regression', label: 'Regressions' },
  ];

  const filteredChallenges = challenges.filter((c) => {
    const matchCategory =
      selectedCategory === 'all' ||
      c.bug_category.toLowerCase() === selectedCategory.toLowerCase();
    const matchDiff =
      selectedDifficulty === 'all' ||
      c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchCategory && matchDiff;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 font-semibold';
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <Bug className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-rose-600">
              Professional Debugging Assessment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            BugHunter Arena
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium font-sans">
              Python Diagnostic Sandboxes
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Diagnose broken implementations, isolate edge cases, formulate root-cause hypotheses, and ship regression-safe fixes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBugHunterData}
            className="gap-1.5 text-xs text-slate-700 hover:text-slate-900"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Gamification & Daily Bug Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Bug Challenge Hero */}
        <div className="lg:col-span-8 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/80 via-white to-white p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600 text-white shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Daily Bug Challenge
              </span>
            </div>
            {dailyChallenge && (
              <span
                className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyColor(
                  dailyChallenge.difficulty
                )}`}
              >
                {dailyChallenge.difficulty}
              </span>
            )}
          </div>

          {dailyChallenge ? (
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">{dailyChallenge.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Category: <span className="text-rose-700 font-medium capitalize">{dailyChallenge.bug_category.replace('_', ' ')}</span>.
                Investigate the failure, verify reproduction, formulate your hypothesis, and restore regression safety.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dailyChallenge.relevant_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              No daily challenge currently featured.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rose-100">
            <span className="text-xs text-slate-500 font-medium">
              Maintains daily streak & awards Root Cause Detective XP
            </span>
            {dailyChallenge && (
              <Link to={`/dashboard/bughunter/${dailyChallenge.slug}`}>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs gap-1.5 shadow-xs">
                  <Bug className="h-3.5 w-3.5" />
                  Debug Today's Issue
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Streak & Badges Widget */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
              Debugging Streak
            </span>
            <span className="text-xs font-mono font-bold text-amber-600">
              {streak?.current_streak || 0} Days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Fixed
              </span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {streak?.total_bugs_fixed || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Points Earned
              </span>
              <span className="text-xl font-bold font-mono text-brand-600">
                {streak?.points || 0}
              </span>
            </div>
          </div>

          {/* Badges showcase */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Award className="h-3 w-3 text-amber-500" />
              Earned Badges ({streak?.badges.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {streak?.badges.length ? (
                streak.badges.map((b) => (
                  <span
                    key={b.id}
                    title={b.description}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    <span>{b.icon}</span>
                    <span>{b.badge_name}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  Solve your first debugging challenge to earn badges.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white font-medium"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Challenges Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse" />
          ))}
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((ch) => (
            <div
              key={ch.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4 hover:border-rose-300 hover:shadow-md transition-all group shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                    {ch.bug_category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyColor(
                      ch.difficulty
                    )}`}
                  >
                    {ch.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                  {ch.title}
                </h3>

                <div className="flex flex-wrap gap-1">
                  {ch.relevant_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Runtime: <strong className="text-slate-800 uppercase font-semibold">{ch.language}</strong>
                </span>
                <Link to={`/dashboard/bughunter/${ch.slug}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1 group-hover:border-rose-300 group-hover:text-rose-700 font-semibold">
                    Inspect & Fix <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-2 shadow-xs">
          <Bug className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No debugging challenges found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your category or difficulty filters.
          </p>
        </div>
      )}
    </div>
  );
}

export default BugHunterPage;
