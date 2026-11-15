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
        return 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/30 font-semibold';
      case 'medium':
        return 'bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/30 font-semibold';
      case 'hard':
        return 'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/30 font-semibold';
      default:
        return 'bg-[#1e1e1e] text-[#9ca3af] border-[#383838] font-semibold';
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/30">
              <Bug className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#ff375f]">
              Professional Debugging Assessment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ffffff] flex items-center gap-3">
            BugHunter Arena
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] border border-[#383838] text-[#9ca3af] font-medium font-sans">
              Python Diagnostic Sandboxes
            </span>
          </h1>
          <p className="text-sm text-[#cbd5e1] mt-1 max-w-2xl">
            Diagnose broken implementations, isolate edge cases, formulate root-cause hypotheses, and ship regression-safe fixes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBugHunterData}
            className="gap-1.5 text-xs border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:bg-[#2e2e2e]"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Gamification & Daily Bug Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Bug Challenge Hero */}
        <div className="lg:col-span-8 rounded-2xl border border-[#383838] bg-[#262626] p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#ff375f] text-white shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff375f]">
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
              <h2 className="text-xl font-bold text-[#ffffff]">{dailyChallenge.title}</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">
                Category: <span className="text-[#ffa116] font-medium capitalize">{dailyChallenge.bug_category.replace('_', ' ')}</span>.
                Investigate the failure, verify reproduction, formulate your hypothesis, and restore regression safety.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dailyChallenge.relevant_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1e1e1e] border border-[#383838] text-[#d1d5db] font-medium"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#9ca3af]">
              No daily challenge currently featured.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#383838]">
            <span className="text-xs text-[#9ca3af] font-medium">
              Maintains daily streak & awards Root Cause Detective XP
            </span>
            {dailyChallenge && (
              <Link to={`/dashboard/bughunter/${dailyChallenge.slug}`}>
                <Button className="bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold text-xs gap-1.5 shadow-xs">
                  <Bug className="h-3.5 w-3.5" />
                  Debug Today's Issue
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Streak & Badges Widget */}
        <div className="lg:col-span-4 rounded-2xl border border-[#383838] bg-[#262626] p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ffffff] flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-[#ffa116] fill-[#ffa116]" />
              Debugging Streak
            </span>
            <span className="text-xs font-mono font-bold text-[#ffa116]">
              {streak?.current_streak || 0} Days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">
              <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">
                Total Fixed
              </span>
              <span className="text-xl font-bold font-mono text-[#ffffff]">
                {streak?.total_bugs_fixed || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">
              <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">
                Points Earned
              </span>
              <span className="text-xl font-bold font-mono text-[#ffa116]">
                {streak?.points || 0}
              </span>
            </div>
          </div>

          {/* Badges showcase */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] flex items-center gap-1">
              <Award className="h-3 w-3 text-[#ffa116]" />
              Earned Badges ({streak?.badges.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {streak?.badges.length ? (
                streak.badges.map((b) => (
                  <span
                    key={b.id}
                    title={b.description}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/30"
                  >
                    <span>{b.icon}</span>
                    <span>{b.badge_name}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#9ca3af]">
                  Solve your first debugging challenge to earn badges.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#ffa116] text-black shadow-xs font-bold'
                  : 'text-[#d1d5db] hover:bg-[#1e1e1e] hover:text-[#ffffff] border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#9ca3af]" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-[#383838] bg-[#1e1e1e] px-3 py-1.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffa116] font-medium cursor-pointer"
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
            <div key={i} className="h-44 rounded-2xl border border-[#383838] bg-[#262626] p-5 animate-pulse" />
          ))}
        </div>
      ) : filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((ch) => (
            <div
              key={ch.id}
              className="rounded-2xl border border-[#383838] bg-[#262626] p-5 flex flex-col justify-between space-y-4 hover:border-[#ffa116] hover:shadow-md transition-all group shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#cbd5e1]">
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

                <h3 className="text-base font-bold text-[#ffffff] group-hover:text-[#ffa116] transition-colors">
                  {ch.title}
                </h3>

                <div className="flex flex-wrap gap-1">
                  {ch.relevant_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1e1e1e] text-[#9ca3af] font-medium"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#383838]">
                <span className="text-xs text-[#9ca3af] font-medium">
                  Runtime: <strong className="text-[#ffffff] uppercase font-semibold">{ch.language}</strong>
                </span>
                <Link to={`/dashboard/bughunter/${ch.slug}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:border-[#ffa116] hover:text-[#ffa116] font-semibold">
                    Inspect & Fix <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#383838] bg-[#262626] p-12 text-center space-y-2 shadow-sm">
          <Bug className="h-8 w-8 text-[#9ca3af] mx-auto" />
          <h3 className="text-sm font-bold text-[#ffffff]">No debugging challenges found</h3>
          <p className="text-xs text-[#9ca3af]">
            Try adjusting your category or difficulty filters.
          </p>
        </div>
      )}
    </div>
  );
}

export default BugHunterPage;
