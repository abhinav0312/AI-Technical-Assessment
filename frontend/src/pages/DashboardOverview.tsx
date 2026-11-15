import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import {
  Code2,
  Brain,
  Flame,
  CheckCircle2,
  ArrowRight,
  Search,
  Play,
  Bug,
  Network,
  BarChart3,
  Trophy,
  Zap,
  Gamepad2,
} from 'lucide-react';
import { Challenge } from '@/types/challenge';

interface InterviewSession {
  id: string;
  title: string;
  role_target: string;
  difficulty: string;
  status: string;
  score: number | null;
  recommendation: string | null;
  created_at: string;
}

interface DashboardMetrics {
  assessments_completed: number;
  challenges_solved: number;
}

export function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quest filter & search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [cRes, mRes, iRes] = await Promise.allSettled([
          apiClient<{ items: Challenge[] }>('/challenges?page_size=50'),
          apiClient<DashboardMetrics>('/dashboard/metrics'),
          apiClient<InterviewSession[]>('/interview/sessions'),
        ]);

        if (cRes.status === 'fulfilled' && cRes.value?.items) {
          setChallenges(cRes.value.items);
        }
        if (mRes.status === 'fulfilled') {
          setMetrics(mRes.value);
        }
        if (iRes.status === 'fulfilled') {
          setInterviews(iRes.value);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  // Difficulty counts
  const easyTotal = challenges.filter((c) => c.difficulty === 'easy').length;
  const mediumTotal = challenges.filter((c) => c.difficulty === 'medium').length;
  const hardTotal = challenges.filter((c) => c.difficulty === 'hard').length;

  const easySolved = challenges.filter((c) => c.difficulty === 'easy' && c.user_status === 'completed').length;
  const mediumSolved = challenges.filter((c) => c.difficulty === 'medium' && c.user_status === 'completed').length;
  const hardSolved = challenges.filter((c) => c.difficulty === 'hard' && c.user_status === 'completed').length;

  const totalSolved = metrics?.challenges_solved ?? (easySolved + mediumSolved + hardSolved);

  // Filtered Quest list
  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  // Daily Quest
  const dailyQuest = challenges.find((c) => c.difficulty === 'medium') || challenges[0];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto font-sans animate-pulse text-white">
        <div className="h-44 rounded-2xl bg-[#262626] border border-[#383838]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#262626] border border-[#383838]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans animate-in fade-in duration-200 text-[#eff2f6]">
      {/* 1. LeetCode-Style Progress & Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Candidate Profile & Streak Card */}
        <div className="md:col-span-5 p-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffa116] to-[#ff7a00] text-black font-black text-lg shadow-xs">
              {user?.displayName?.slice(0, 1).toUpperCase() || 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">{user?.displayName || 'Engineer'}</h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40">
                  {user?.role || 'candidate'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">{user?.email || 'engineer@devmind.ai'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#383838] text-xs">
            <div className="p-2.5 rounded-xl bg-[#2e2417] border border-[#ffa116]/40 flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#ffa116] fill-[#ffa116] shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-[#ffa116]">Streak</span>
                <p className="text-sm font-extrabold text-white">3 Days</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#281b36] border border-purple-500/40 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-300">Interviews</span>
                <p className="text-sm font-extrabold text-white">{interviews.length} Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* LeetCode Solved Problems Ring & Difficulty Breakdown */}
        <div className="md:col-span-7 p-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Solved Ring Count */}
          <div className="flex flex-col items-center justify-center text-center p-3">
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full border-4 border-[#ffa116]/30 bg-[#1e1e1e]">
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{totalSolved}</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Solved</span>
              </div>
            </div>
            <span className="text-[11px] text-neutral-400 font-semibold mt-1.5">
              out of {challenges.length} Quests
            </span>
          </div>

          {/* Easy / Medium / Hard LeetCode Pill Bars */}
          <div className="flex-1 w-full space-y-3 text-xs">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#00b8a3] font-bold">Easy</span>
                <span className="text-white font-mono font-bold">
                  {easySolved} <span className="text-neutral-400 font-normal">/ {easyTotal || 5}</span>
                </span>
              </div>
              <div className="h-2 w-full bg-[#1e1e1e] rounded-full overflow-hidden border border-[#383838]">
                <div
                  className="h-full bg-[#00b8a3] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (easySolved / (easyTotal || 1)) * 100 || 20)}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#ffc01e] font-bold">Medium</span>
                <span className="text-white font-mono font-bold">
                  {mediumSolved} <span className="text-neutral-400 font-normal">/ {mediumTotal || 8}</span>
                </span>
              </div>
              <div className="h-2 w-full bg-[#1e1e1e] rounded-full overflow-hidden border border-[#383838]">
                <div
                  className="h-full bg-[#ffc01e] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (mediumSolved / (mediumTotal || 1)) * 100 || 35)}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#ff375f] font-bold">Hard</span>
                <span className="text-white font-mono font-bold">
                  {hardSolved} <span className="text-neutral-400 font-normal">/ {hardTotal || 3}</span>
                </span>
              </div>
              <div className="h-2 w-full bg-[#1e1e1e] rounded-full overflow-hidden border border-[#383838]">
                <div
                  className="h-full bg-[#ff375f] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (hardSolved / (hardTotal || 1)) * 100 || 15)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Tier Pillars: Daily Coding Quest & AI Technical Interview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Coding Quest */}
        <div className="lg:col-span-6 p-6 rounded-3xl border border-[#ffa116]/40 bg-gradient-to-br from-[#2c2214] via-[#262626] to-[#1f1a14] shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffa116]/20 text-[#ffa116] text-[10px] font-extrabold border border-[#ffa116]/40">
                <Flame className="h-3.5 w-3.5 fill-[#ffa116]" />
                DAILY CODING QUEST
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-1.5">
              {dailyQuest?.title || 'Sliding Window Rate Limiter'}
            </h2>
            <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-4">
              {dailyQuest?.description || 'Implement an optimal in-memory algorithm enforcing throughput bounds under O(1) amortized memory.'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  dailyQuest?.difficulty === 'hard'
                    ? 'bg-[#ff375f]/20 text-[#ff375f] border-[#ff375f]/40'
                    : dailyQuest?.difficulty === 'medium'
                    ? 'bg-[#ffc01e]/20 text-[#ffc01e] border-[#ffc01e]/40'
                    : 'bg-[#00b8a3]/20 text-[#00b8a3] border-[#00b8a3]/40'
                }`}
              >
                {dailyQuest?.difficulty || 'Medium'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e1e1e] text-neutral-300 border border-[#383838]">
                +10 Quest Points
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#383838] flex items-center justify-between">
            <span className="text-xs text-neutral-400">Solve before midnight</span>
            <Link to={`/dashboard/arena?challenge=${dailyQuest?.slug || 'sliding-window-rate-limiter'}`}>
              <Button size="sm" className="gap-1.5 font-bold shadow-xs bg-[#ffa116] hover:bg-[#ff9000] text-black">
                <Play className="h-3.5 w-3.5 fill-current" />
                Solve Daily Quest
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Technical Interview (InterviewX) */}
        <div className="lg:col-span-6 p-6 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-[#2a1a38] via-[#262626] to-[#1c1426] shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                <Brain className="h-3 w-3 text-purple-400" />
                INTERVIEWX AI
              </span>
              <span className="text-[11px] text-purple-300 font-semibold">
                FAANG / Principal Simulator
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-1.5">
              Principal Technical Interview
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Turn-by-turn conversational technical interview with an AI Principal Interviewer. Covers Big-O complexity, edge cases, live code evaluation, and a 4-pillar scorecard.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Role: Senior Backend Engineer
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1e1e1e] text-neutral-300 border border-[#383838]">
                4-Pillar Scorecard
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#383838] flex items-center justify-between">
            <span className="text-xs text-neutral-400">Live AI Audio & Chat Dialogue</span>
            <Link to="/interview">
              <Button size="sm" className="gap-1.5 font-bold shadow-xs bg-purple-600 hover:bg-purple-700 text-white">
                <Brain className="h-3.5 w-3.5" />
                Start Technical Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Restored Core Platform Modules: BugHunter, DevSim, SkillGraph, Contests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#ffa116]" />
              Engineering Intelligence Suites
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-medium">
              Comprehensive debugging, distributed system simulations, and competency benchmarking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* BugHunter Card */}
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                  <Bug className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Debugging
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">BugHunter Arena</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Diagnose memory leaks, concurrency race conditions, and production outages in realistic multi-file codebases.
              </p>
            </div>
            <Link to="/dashboard/bughunter" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-rose-300 border-[#383838] hover:bg-rose-500/20 hover:text-white">
                Launch BugHunter
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* DevSim Architecture Simulator */}
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <Network className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  System Design
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">DevSim Architect</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Interactive system design simulator. Inject network partitions, test sharded KV stores, and verify saga orchestrations.
              </p>
            </div>
            <Link to="/dashboard/devsim" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-indigo-300 border-[#383838] hover:bg-indigo-500/20 hover:text-white">
                Explore DevSim
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* DevArcade Minigames Lounge */}
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Gamepad2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Minigames
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">DevArcade Lounge</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                SpeedCoder typing racer, Bug Smasher sprint, Bitwise blitz, and live CyberPong physics code modifier.
              </p>
            </div>
            <Link to="/dashboard/arcade" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-emerald-300 border-[#383838] hover:bg-emerald-500/20 hover:text-white">
                Play Arcade Games
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* SkillGraph Competency Radar */}
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Top 8%
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">SkillGraph Radar</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Continuous cognitive competency metrics across Concurrency (90%), Distributed Systems (85%), and Algorithmic Optimization (94%).
              </p>
            </div>
            <Link to="/dashboard/skillgraph" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-emerald-300 border-[#383838] hover:bg-emerald-500/20 hover:text-white">
                View Skill Radar
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Global Contests */}
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-[#ffa116]/20 text-[#ffa116] flex items-center justify-center border border-[#ffa116]/40">
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40">
                  Live Contest
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">Bi-Weekly Global #1</h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Compete against top global engineers across 4 algorithm challenges with live penalty rankings and real-time leaderboards.
              </p>
            </div>
            <Link to="/dashboard/contests" className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold text-[#ffa116] border-[#383838] hover:bg-[#ffa116]/20 hover:text-white">
                Enter Contest Arena
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Quest Problems Directory (LeetCode Table) */}
      <div className="rounded-2xl border border-[#383838] bg-[#262626] shadow-md p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#ffa116]" />
              Quest Problem Directory
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-medium">
              Solve LeetCode-style algorithmic challenges across Arrays, Trees, Dynamic Programming, and Systems.
            </p>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center rounded-xl border border-[#383838] bg-[#1e1e1e] p-0.5 text-xs font-semibold">
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  difficultyFilter === diff
                    ? 'bg-[#ffa116] text-black font-extrabold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Quest problems by name or category (e.g. Rate Limiter, Two Sum, Distributed)..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ffa116] focus:border-[#ffa116] transition-all"
          />
        </div>

        {/* LeetCode Problem Table */}
        <div className="overflow-x-auto rounded-xl border border-[#383838]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1e1e] border-b border-[#383838] text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Status</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-neutral-200">
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map((c, i) => {
                  const isCompleted = c.user_status === 'completed';
                  const isAttempted = c.user_status === 'attempted';

                  return (
                    <tr key={c.id} className="hover:bg-[#2e2e2e] transition-colors">
                      <td className="py-3 px-4 text-center">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-[#00b8a3] mx-auto" />
                        ) : isAttempted ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#ffc01e] mx-auto" />
                        ) : (
                          <span className="text-neutral-500 font-mono text-[11px]">#{i + 1}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-white">
                        <Link
                          to={`/dashboard/arena?challenge=${c.slug}`}
                          className="hover:text-[#ffa116] transition-colors"
                        >
                          {c.title}
                        </Link>
                      </td>

                      <td className="py-3 px-4 text-neutral-400 capitalize">
                        {c.category?.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                            c.difficulty === 'hard'
                              ? 'bg-[#ff375f]/20 text-[#ff375f] border-[#ff375f]/40'
                              : c.difficulty === 'medium'
                              ? 'bg-[#ffc01e]/20 text-[#ffc01e] border-[#ffc01e]/40'
                              : 'bg-[#00b8a3]/20 text-[#00b8a3] border-[#00b8a3]/40'
                          }`}
                        >
                          {c.difficulty}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link to={`/dashboard/arena?challenge=${c.slug}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#ffa116] hover:text-[#ffb74d] hover:bg-[#ffa116]/10 font-bold">
                            Solve
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-medium">
                    No Quests found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Past Interview Sessions (if any) */}
      {interviews.length > 0 && (
        <div className="rounded-2xl border border-[#383838] bg-[#262626] shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              Your Interview Sessions ({interviews.length})
            </h3>
            <Link to="/interview" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
              New Interview +
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {interviews.map((sess) => (
              <div
                key={sess.id}
                onClick={() => navigate('/interview')}
                className="p-3.5 rounded-xl border border-[#383838] hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer bg-[#1e1e1e] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white line-clamp-1">{sess.title}</span>
                  {sess.score !== null ? (
                    <span className="font-mono font-bold text-purple-300">{sess.score}/100</span>
                  ) : (
                    <span className="text-[10px] text-[#ffa116] font-bold">In Progress</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{sess.role_target}</span>
                  {sess.recommendation && (
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
                      {sess.recommendation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
