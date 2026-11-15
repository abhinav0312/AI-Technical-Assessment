import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Code2,
  Bug,
  Cpu,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  Briefcase,
  Gamepad2,
  Zap,
  TrendingUp,
  Clock,
  Star,
  Check,
  Building2,
  Flame,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  // If user is already logged in, render the Authenticated Developer Portal
  if (isAuthenticated && user) {
    return <AuthenticatedHome user={user} />;
  }

  // Otherwise, render DevMind AI's signature Public Platform Landing Page
  return <PublicDevMindLanding />;
}

// =========================================================================
// 1. AUTHENTICATED DEVELOPER HOME (FOR LOGGED-IN USERS TO ACCESS THE SITE)
// =========================================================================
function AuthenticatedHome({ user }: { user: { displayName?: string; email?: string; role?: string } }) {
  const [demoLang, setDemoLang] = useState<'python' | 'typescript'>('python');
  const [demoTab, setDemoTab] = useState<'code' | 'tests'>('code');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const pythonDemoCode = `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`;

  const tsDemoCode = `function twoSum(nums: number[], target: number): number[] {
  const lookup = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (lookup.has(diff)) {
      return [lookup.get(diff)!, i];
    }
    lookup.set(nums[i], i);
  }
  return [];
}`;

  const handleRunDemo = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setDemoTab('tests');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#eff2f6] flex flex-col font-sans antialiased selection:bg-[#ffa116]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Top Developer Welcome Strip */}
        <section className="bg-gradient-to-b from-[#1e1e1e] to-[#141414] border-b border-[#2d2d2d] py-8">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    Welcome back, {user.displayName || 'Engineer'}
                  </span>
                  <span className="text-xl">👋</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Ready for today's engineering sprint? Access your active challenges, telemetry, and live arenas below.
                </p>
              </div>

              {/* Developer Telemetry Quick Pills */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222222] border border-[#333333] shadow-xs">
                  <Flame className="h-4 w-4 text-[#ffa116] fill-[#ffa116]" />
                  <div className="text-left">
                    <div className="text-[10px] text-neutral-400 font-medium">Daily Streak</div>
                    <div className="text-xs font-bold text-white font-mono">3 Days</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222222] border border-[#333333] shadow-xs">
                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                  <div className="text-left">
                    <div className="text-[10px] text-neutral-400 font-medium">Solved</div>
                    <div className="text-xs font-bold text-white font-mono">24 Quests</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222222] border border-[#333333] shadow-xs">
                  <Trophy className="h-4 w-4 text-[#ffa116]" />
                  <div className="text-left">
                    <div className="text-[10px] text-neutral-400 font-medium">Contest Elo</div>
                    <div className="text-xs font-bold text-white font-mono">1,840</div>
                  </div>
                </div>

                <Link to="/dashboard">
                  <Button size="sm" className="bg-[#ffa116] hover:bg-[#ff9000] text-black font-extrabold gap-1.5 cursor-pointer">
                    Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-10">
          {/* Daily Quest Problem of the Day */}
          <div className="p-6 rounded-2xl border border-[#333333] bg-gradient-to-r from-[#1c1c1c] via-[#222222] to-[#1c1c1c] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#ffa116]/10 to-transparent pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ffa116]/20 border border-[#ffa116]/40 text-[#ffa116] text-[11px] font-extrabold flex items-center gap-1">
                    <Flame className="h-3 w-3 fill-[#ffa116]" />
                    Daily Challenge
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    Easy
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">+15 Streak XP</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  1. Two Sum — Hash Map Optimization
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                  Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>. Target optimal O(N) single-pass hash lookup.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link to="/challenges/two-sum">
                  <Button size="lg" className="rounded-full bg-[#00b8a3] hover:bg-[#009b88] text-white font-extrabold px-6 h-11 text-sm shadow-md gap-2 cursor-pointer">
                    <Play className="h-4 w-4 fill-current" />
                    Solve Challenge
                  </Button>
                </Link>
                <Link to="/challenges">
                  <Button variant="outline" size="lg" className="rounded-full border-[#383838] bg-[#1e1e1e] hover:bg-[#2b2b2b] text-neutral-300 font-bold px-5 h-11 text-sm cursor-pointer">
                    Browse Quests
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Access Arena Hub */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#ffa116]" />
                DevMind Arena — Direct Access
              </h2>
              <span className="text-xs text-neutral-400">All modules active & ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Quest Problem Bank */}
              <Link
                to="/challenges"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-[#ffa116] transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-[#ffa116]/15 text-[#ffa116] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#ffa116] transition-colors">
                    Quest Arena
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Over 3,000 algorithmic challenges with real-time test case runner and isolated judge execution.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#ffa116] pt-2 border-t border-[#2d2d2d]">
                  <span>Explore 3,000+ Problems</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Live Contests */}
              <Link
                to="/contests"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-amber-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Live Contests
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Weekly and Bi-Weekly rated competitions with live leaderboards, Elo updates, and timed pressure.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-amber-400 pt-2 border-t border-[#2d2d2d]">
                  <span>Join Live Contest</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: InterviewX AI */}
              <Link
                to="/interview"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-purple-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                    InterviewX AI
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Full AI technical interviewer with live conversational audio, whiteboard, and ThinkTrace scoring.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-purple-400 pt-2 border-t border-[#2d2d2d]">
                  <span>Start Mock Interview</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 4: DevArcade Minigames */}
              <Link
                to="/arcade"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-sky-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                    DevArcade (2 Games)
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    SpeedCoder Nitro typing racer & ByteSnake 2077 matrix memory runner with real algorithmic code assembly.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-sky-400 pt-2 border-t border-[#2d2d2d]">
                  <span>Play Arcade Games</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 5: BugHunter Arena */}
              <Link
                to="/bughunter"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-rose-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Bug className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                    BugHunter
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Root-cause debugging sandboxes with intentionally broken real-world code and failing tests.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-rose-400 pt-2 border-t border-[#2d2d2d]">
                  <span>Fix Broken Code</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 6: DevSim Real-World Simulations */}
              <Link
                to="/devsim"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-emerald-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    DevSim Workspaces
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Multi-file engineering challenges: REST APIs, database bottlenecks, and distributed architecture.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 pt-2 border-t border-[#2d2d2d]">
                  <span>Launch Simulation</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 7: CodeTwin SkillGraph */}
              <Link
                to="/dashboard/skillgraph"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-indigo-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    CodeTwin SkillGraph
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Real-time radar telemetry analyzing 32 engineering competencies, weak spots, and recommendations.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 pt-2 border-t border-[#2d2d2d]">
                  <span>View Skill Radar</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 8: Submissions & Activity */}
              <Link
                to="/dashboard/submissions"
                className="group p-5 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-teal-400 transition-all hover:shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                    Submissions History
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    View runtime memory diagnostics, historical code diffs, and accepted verdict breakdown.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-teal-400 pt-2 border-t border-[#2d2d2d]">
                  <span>Review Past Code</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* Code Playground Scratchpad */}
          <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#00b8a3]" />
                  Quick Scratchpad & Code Runner
                </h3>
                <p className="text-xs text-neutral-400">Test algorithm logic on the fly with sub-millisecond execution</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-[#141414] p-0.5 border border-[#333333] text-[11px] font-semibold">
                  <button
                    onClick={() => setDemoLang('python')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${demoLang === 'python' ? 'bg-[#2b2b2b] text-white font-bold' : 'text-neutral-400'}`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setDemoLang('typescript')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${demoLang === 'typescript' ? 'bg-[#2b2b2b] text-white font-bold' : 'text-neutral-400'}`}
                  >
                    TypeScript
                  </button>
                </div>

                <Button
                  size="sm"
                  onClick={handleRunDemo}
                  disabled={isRunningTests}
                  className="h-8 text-xs bg-[#00b8a3] hover:bg-[#009b88] text-white font-bold gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {isRunningTests ? 'Executing...' : 'Run Scratchpad'}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d2d2d] bg-[#141414] p-4 font-mono text-xs leading-relaxed overflow-x-auto min-h-[160px]">
              {demoTab === 'code' ? (
                <pre className="text-neutral-200">
                  {demoLang === 'python' ? pythonDemoCode : tsDemoCode}
                </pre>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Accepted — 3/3 Test Cases Passed</span>
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Execution Runtime: <span className="text-white font-bold">0.4 ms</span> (beats 96.4% of users)
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Memory Allocation: <span className="text-white font-bold">14.2 MB</span> (beats 88.2% of users)
                  </div>
                  <button
                    onClick={() => setDemoTab('code')}
                    className="text-xs text-[#00b8a3] underline mt-2 block font-semibold cursor-pointer"
                  >
                    ← Edit Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// =========================================================================
// 2. PUBLIC DEVMIND PLATFORM LANDING (SIGNATURE HIGH-TECH DARK IDENTITY)
// =========================================================================
function PublicDevMindLanding() {
  const [demoLang, setDemoLang] = useState<'python' | 'typescript'>('python');
  const [demoTab, setDemoTab] = useState<'problem' | 'code' | 'tests' | 'ai'>('code');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const pythonDemoCode = `class RateLimiter:
    def __init__(self, max_reqs: int, window_sec: float):
        self.max = max_reqs
        self.window = window_sec
        self.clients = {}  # client_id -> list of timestamps

    def allow_request(self, client_id: str, ts: float) -> bool:
        times = self.clients.setdefault(client_id, [])
        # Evict timestamps older than current window
        cutoff = ts - self.window
        self.clients[client_id] = [t for t in times if t > cutoff]
        
        if len(self.clients[client_id]) < self.max:
            self.clients[client_id].append(ts)
            return True
        return False`;

  const tsDemoCode = `class RateLimiter {
  private clients = new Map<string, number[]>();

  constructor(private maxReqs: number, private windowSec: number) {}

  allowRequest(clientId: string, ts: number): boolean {
    const times = this.clients.get(clientId) ?? [];
    const cutoff = ts - this.windowSec;
    const active = times.filter((t) => t > cutoff);
    
    if (active.length < this.maxReqs) {
      active.push(ts);
      this.clients.set(clientId, active);
      return true;
    }
    this.clients.set(clientId, active);
    return false;
  }
}`;

  const handleRunDemo = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setDemoTab('tests');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#eff2f6] flex flex-col font-sans antialiased selection:bg-[#ffa116]/30 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ======================================================== */}
        {/* SECTION 1: DEVMIND SIGNATURE HERO & LIVE WORKSPACE       */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-[#181818] via-[#141414] to-[#121212] border-b border-[#2d2d2d]">
          {/* Subtle Cyber Code Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#2d2d2d_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffa116]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            {/* Top Product Badge */}
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ffa116]/30 bg-[#ffa116]/10 text-xs font-bold text-[#ffa116] shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#ffa116]" />
                <span>Next-Gen Engineering Assessment Platform</span>
              </div>

              {/* DevMind Signature Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                Go Beyond Coding.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffa116] via-[#ffb84d] to-[#00b8a3] block sm:inline">
                  Understand Your Engineering Skills.
                </span>
              </h1>

              {/* DevMind Signature Description */}
              <p className="text-base sm:text-xl text-neutral-300 max-w-3xl leading-relaxed font-normal">
                An intelligent technical assessment platform that helps developers demonstrate their abilities,
                understand their architectural weaknesses, and become better engineers through dual-tier AI evaluation.
              </p>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                <Link to="/register">
                  <Button size="lg" className="rounded-full bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] text-black font-extrabold px-8 h-12 text-base shadow-lg shadow-[#ffa116]/20 transition-transform hover:scale-105 gap-2 cursor-pointer">
                    Start Practicing Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button variant="outline" size="lg" className="rounded-full border-[#383838] bg-[#1e1e1e] hover:bg-[#2b2b2b] text-white font-bold px-7 h-12 text-base gap-2 cursor-pointer">
                    <Code2 className="h-4 w-4 text-[#ffa116]" />
                    Interactive Workspace Demo
                  </Button>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                  <span>Real-Time Isolated Execution</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                  <span>ThinkTrace AI Feedback</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                  <span>32-Vector CodeTwin SkillGraph</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                  <span>SpeedCoder & ByteSnake Arcade</span>
                </div>
              </div>
            </div>

            {/* DevMind Signature Live Assessment Workspace Mockup */}
            <div id="demo" className="mt-14 max-w-5xl mx-auto rounded-3xl border border-[#383838] bg-[#1a1a1a] p-4 sm:p-7 shadow-2xl shadow-black/80">
              {/* Window Chrome Bar */}
              <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3.5 mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-neutral-400 text-[11px]">devmind.app // engineering-workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Assessment Active
                  </span>
                </div>
              </div>

              {/* Inner Dashboard Layout Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left 2 Cols: Challenge & Code Summary */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Active Challenge Card */}
                  <div className="p-4 rounded-2xl border border-[#2d2d2d] bg-[#222222]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          System Design
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Medium
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">Solved • 12/12 Tests Passing</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      Sliding Window Rate Limiter
                    </h3>
                    <p className="text-xs text-neutral-300 line-clamp-2">
                      Design an in-memory Sliding Window Rate Limiter that evaluates requests per client against a fixed time window.
                    </p>
                  </div>

                  {/* Interactive Code Window */}
                  <div className="p-4 rounded-2xl border border-[#2d2d2d] bg-[#141414] font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                    <div className="flex items-center justify-between text-neutral-400 pb-2 mb-2 border-b border-[#262626] text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-[#1c1c1c] p-0.5 border border-[#333333] text-[10px] font-semibold">
                          <button
                            onClick={() => setDemoLang('python')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${demoLang === 'python' ? 'bg-[#2b2b2b] text-white font-bold' : 'text-neutral-400'}`}
                          >
                            Python
                          </button>
                          <button
                            onClick={() => setDemoLang('typescript')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${demoLang === 'typescript' ? 'bg-[#2b2b2b] text-white font-bold' : 'text-neutral-400'}`}
                          >
                            TypeScript
                          </button>
                        </div>
                        <span className="text-neutral-500 font-sans hidden sm:inline">rate_limiter.{demoLang === 'python' ? 'py' : 'ts'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-sans font-bold text-[10px]">0.4ms avg runtime</span>
                        <Button
                          size="sm"
                          onClick={handleRunDemo}
                          disabled={isRunningTests}
                          className="h-6 text-[10px] bg-[#00b8a3] hover:bg-[#009b88] text-white font-bold gap-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                          {isRunningTests ? 'Running...' : 'Run'}
                        </Button>
                      </div>
                    </div>

                    {demoTab === 'code' ? (
                      <pre className="text-neutral-200">
                        {demoLang === 'python' ? pythonDemoCode : tsDemoCode}
                      </pre>
                    ) : (
                      <div className="space-y-2 py-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>12/12 Unit Tests Passed (Zero Regressions)</span>
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          Runtime: <span className="text-white font-bold">0.4 ms</span> (beats 97.2% of submissions)
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          Memory: <span className="text-white font-bold">14.1 MB</span> (beats 91.8% of submissions)
                        </div>
                        <button
                          onClick={() => setDemoTab('code')}
                          className="text-xs text-[#00b8a3] underline mt-1.5 block font-semibold cursor-pointer"
                        >
                          ← View Source Code
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Feedback Bar */}
                  <div className="p-3.5 rounded-2xl border border-[#00b8a3]/30 bg-[#00b8a3]/10 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#00b8a3] text-black shrink-0 mt-0.5 font-bold">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>ThinkTrace AI Feedback</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00b8a3]/20 text-[#00b8a3] font-mono border border-[#00b8a3]/40">
                          Complexity: O(N)
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Clean timestamp boundary enforcement. Proactively cleans up dormant request logs under concurrent load with zero memory leak.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Skill Overview & Progress Metrics */}
                <div className="space-y-4">
                  {/* Skill Progress Card */}
                  <div className="p-4 rounded-2xl border border-[#2d2d2d] bg-[#222222] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Skill Proficiency</h4>
                      <span className="text-xs font-black text-[#ffa116]">88% Overall</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-neutral-300 mb-1">
                          <span>System Architecture</span>
                          <span className="font-bold text-white">92%</span>
                        </div>
                        <div className="h-2 w-full bg-[#141414] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#ffa116] to-[#ff8c00] rounded-full w-[92%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-neutral-300 mb-1">
                          <span>Concurrency & Threads</span>
                          <span className="font-bold text-white">88%</span>
                        </div>
                        <div className="h-2 w-full bg-[#141414] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-[88%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-neutral-300 mb-1">
                          <span>Data Structures</span>
                          <span className="font-bold text-white">94%</span>
                        </div>
                        <div className="h-2 w-full bg-[#141414] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-neutral-300 mb-1">
                          <span>Debugging & Resilience</span>
                          <span className="font-bold text-white">85%</span>
                        </div>
                        <div className="h-2 w-full bg-[#141414] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full w-[85%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl border border-[#2d2d2d] bg-[#1a1a1a]">
                      <div className="text-[11px] text-neutral-400">Challenges Solved</div>
                      <div className="text-lg font-black text-white">24</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#2d2d2d] bg-[#1a1a1a]">
                      <div className="text-[11px] text-neutral-400">Percentile</div>
                      <div className="text-lg font-black text-emerald-400">Top 5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: 4-STAGE LEARNING & ASSESSMENT FLOW            */}
        {/* ======================================================== */}
        <section className="py-20 bg-[#161616] text-white border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#ffa116] uppercase tracking-widest bg-[#ffa116]/10 border border-[#ffa116]/30 px-3 py-1 rounded-full">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                A Smarter 4-Stage Engineering Assessment Flow
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                Traditional tests only check if code compiles. DevMind AI evaluates how you analyze, construct, and refine technical systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stage 01 */}
              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-[#ffa116] transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#ffa116]/15 text-[#ffa116] flex items-center justify-center font-bold">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-500 group-hover:text-[#ffa116] transition-colors">
                    STAGE 01
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">01 THINK</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Understand and explain your approach. Clarify boundary constraints and propose algorithmic complexity with ThinkTrace AI.
                </p>
              </div>

              {/* Stage 02 */}
              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-[#00b8a3] transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#00b8a3]/15 text-[#00b8a3] flex items-center justify-center font-bold">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-500 group-hover:text-[#00b8a3] transition-colors">
                    STAGE 02
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">02 CODE</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Solve programming problems in Python, C++, Java, or TypeScript with instant, sub-millisecond isolated sandbox judging.
                </p>
              </div>

              {/* Stage 03 */}
              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-amber-400 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                    <Bug className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-500 group-hover:text-amber-400 transition-colors">
                    STAGE 03
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">03 BUILD & FIX</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Work on realistic engineering challenges in DevSim and locate root causes of real regressions inside BugHunter.
                </p>
              </div>

              {/* Stage 04 */}
              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] hover:border-purple-400 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-500 group-hover:text-purple-400 transition-colors">
                    STAGE 04
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">04 GROW</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Track your mastery with interactive 32-vector CodeTwin SkillGraph radars and personalized targeted roadmaps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: THE DEVMIND CORE PILLARS                      */}
        {/* ======================================================== */}
        <section id="quests" className="py-24 bg-[#141414] text-white border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-24">
            {/* Pillar 1: ThinkTrace AI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
                  <Brain className="h-3.5 w-3.5" />
                  <span>ThinkTrace AI — Dual-Tier Evaluation</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Evaluates How You Reason, Not Just What You Type
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Standard judges only tell you if a test passed. ThinkTrace AI analyzes your algorithm selection, time/space complexity trade-offs, and missing edge-cases before executing.
                </p>
                <div className="space-y-3 pt-2 text-xs sm:text-sm text-neutral-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#00b8a3] shrink-0 mt-0.5" />
                    <span>Real-time feedback on asymptotic time and space boundaries</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#00b8a3] shrink-0 mt-0.5" />
                    <span>Identifies subtle concurrency deadlocks, off-by-one errors, and memory leaks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#00b8a3] shrink-0 mt-0.5" />
                    <span>Deterministic execution results strictly separated from AI suggestions</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/challenges">
                    <Button className="rounded-full bg-[#ffa116] hover:bg-[#ff9000] text-black font-extrabold px-6 h-11 text-xs gap-2 cursor-pointer">
                      <span>Try Algorithmic Quests</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-[#333333] bg-[#1e1e1e] p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-400" />
                    ThinkTrace Cognitive Audit
                  </span>
                  <span className="text-purple-400 font-mono text-[11px]">Score: 94/100</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                    <span className="font-bold block text-white mb-0.5">Strengths Identified:</span>
                    Optimal O(1) hash map lookup chosen over O(N²) nested iteration. Space bounds verified within limits.
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <span className="font-bold block text-white mb-0.5">Edge Cases Handled:</span>
                    Empty array guards, negative integers, and duplicate target values.
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: DevSim & BugHunter */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-2xl border border-[#333333] bg-[#1e1e1e] p-5 shadow-2xl order-2 lg:order-1 space-y-3">
                <div className="border-b border-[#2d2d2d] pb-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-bold text-white">Incident #INC-402 — Production Bug</span>
                  </div>
                  <span className="text-rose-400 font-mono text-[11px]">RaceConditionDetected</span>
                </div>
                <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300">
                  AssertionError: Counter yielded 98 instead of 100 under 10 concurrent worker threads. Missing mutex lock guard.
                </div>
                <div className="p-3 rounded-xl border border-[#2d2d2d] bg-[#141414] text-neutral-300 font-mono text-[11px]">
                  <code>{`# Fix: apply concurrency lock guard\nwith self._lock:\n    self._counter += 1`}</code>
                </div>
              </div>

              <div className="space-y-5 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold">
                  <Bug className="h-3.5 w-3.5" />
                  <span>BugHunter & DevSim Architecture</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Real Software Engineering Beyond Toy LeetCode Snippets
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Real engineering is reading existing codebases, diagnosing production regressions, and architecting multi-file distributed systems. DevSim and BugHunter place you in realistic multi-container workspaces.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link to="/bughunter">
                    <Button className="rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 h-11 text-xs gap-2 cursor-pointer">
                      <span>Open BugHunter</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/devsim">
                    <Button variant="outline" className="rounded-full border-[#383838] bg-[#1e1e1e] hover:bg-[#2b2b2b] text-white font-bold px-6 h-11 text-xs gap-2 cursor-pointer">
                      <span>Launch DevSim</span>
                      <Cpu className="h-4 w-4 text-[#00b8a3]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pillar 3: DevArcade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span>DevArcade — Addictive Minigames</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  SpeedCoder Nitro & ByteSnake 2077
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Take a break and sharpen your developer reflexes with our two custom coding minigames featuring Web Audio mechanical key feedback and real-time algorithmic code assembly.
                </p>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400" />
                    <span><strong>SpeedCoder Nitro</strong>: Real code typing racer across Python, TS, Rust & C++ with live WPM & streaks.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400" />
                    <span><strong>ByteSnake 2077</strong>: Matrix memory runner where collecting RAM addresses compiles real algorithmic lines.</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/arcade">
                    <Button className="rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 h-11 text-xs gap-2 cursor-pointer">
                      <span>Play Arcade Games</span>
                      <Gamepad2 className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-[#333333] bg-[#1e1e1e] shadow-2xl grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#141414] border border-[#2d2d2d] space-y-2 text-center">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold text-white">SpeedCoder Nitro</div>
                  <p className="text-[11px] text-neutral-400">120+ WPM typing racer with mechanical audio feedback</p>
                </div>

                <div className="p-4 rounded-xl bg-[#141414] border border-[#2d2d2d] space-y-2 text-center">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold text-white">ByteSnake 2077</div>
                  <p className="text-[11px] text-neutral-400">Matrix runner compiling real code token by token</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: CONTESTS SECTION                              */}
        {/* ======================================================== */}
        <section id="contest" className="py-24 bg-[#181818] text-white border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/30 text-xs font-bold text-[#ffa116]">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Competitive Coding Arenas</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Bi-Weekly Contests. Global Elo Standing.
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Participate in live 90-minute competitive coding rounds. Compete against over 50,000 engineers globally, benchmark your speed and accuracy under pressure, and watch your Elo rating climb.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#222222] border border-[#333333]">
                    <div className="text-2xl font-black text-[#ffa116]">Bi-Weekly</div>
                    <div className="text-xs text-neutral-400 mt-1">4 fresh problems every contest</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#222222] border border-[#333333]">
                    <div className="text-2xl font-black text-[#00b8a3]">Elo Rated</div>
                    <div className="text-xs text-neutral-400 mt-1">Verified developer standings</div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/contests">
                    <Button className="rounded-full bg-[#ffa116] hover:bg-[#ff9000] text-black font-extrabold px-7 h-11 text-xs shadow-md gap-1.5 cursor-pointer">
                      <span>Explore Contests</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Contest Card Preview */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-2xl border border-[#333333] bg-[#222222] shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#2d2d2d]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#ffa116]/20 text-[#ffa116] flex items-center justify-center font-black">
                        #42
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">DevMind Weekly Contest 42</h4>
                        <span className="text-xs text-emerald-400 font-semibold">Starts Saturday, 8:00 PM EST</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      Registration Open
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { num: 'Q1', title: 'Minimum Operations to Exceed Threshold', diff: 'Easy', pts: '3 pts' },
                      { num: 'Q2', title: 'Maximum Subarray Sum with Fixed Length', diff: 'Medium', pts: '4 pts' },
                      { num: 'Q3', title: 'Shortest Distance After Road Addition Queries', diff: 'Medium', pts: '5 pts' },
                      { num: 'Q4', title: 'Count Valid Paths in Grid Graph', diff: 'Hard', pts: '6 pts' },
                    ].map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#2d2d2d]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-neutral-400">{q.num}</span>
                          <span className="text-xs font-medium text-white">{q.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${q.diff === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' : q.diff === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                            {q.diff}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">{q.pts}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: DEVMIND PREMIUM                               */}
        {/* ======================================================== */}
        <section id="premium" className="py-24 bg-gradient-to-b from-[#181818] via-[#141414] to-[#121212] text-white border-b border-[#2d2d2d] relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/30 text-xs font-bold text-[#ffa116]">
                <Star className="h-3.5 w-3.5 fill-[#ffa116]" />
                <span>DevMind Premium Membership</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Supercharge Your Career Preparation
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                Gain an unfair advantage with company-targeted question sets, unlimited AI mock interviews, lightning-fast isolated cloud judges, and comprehensive video editorials.
              </p>
            </div>

            {/* 6 Core Premium Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] space-y-3 hover:border-[#ffa116] transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#ffa116]/15 text-[#ffa116] flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Company-Specific Sets</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Target questions frequently asked at Google, Meta, Apple, Amazon, and Netflix with recency filters (last 30, 90, 180 days).
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] space-y-3 hover:border-[#00b8a3] transition-colors">
                <div className="h-10 w-10 rounded-xl bg-[#00b8a3]/15 text-[#00b8a3] flex items-center justify-center font-bold">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Lightning Judge Queue</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Skip the public queue with dedicated high-performance cloud execution workers providing instant &lt; 50ms results.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] space-y-3 hover:border-purple-400 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Unlimited InterviewX AI</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Real-time conversational voice mock interviews with an adaptive AI evaluator that challenges your algorithmic complexity.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] space-y-3 hover:border-sky-400 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">Cloud DevSim Sandboxes</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Full multi-container workspaces for distributed systems, backend REST APIs, Redis caching, and real-world incidents.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] space-y-3 hover:border-emerald-400 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <h3 className="text-base font-bold text-white">Video Solutions & Editorials</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Step-by-step visual solution guides covering optimal time and space complexity with zero boilerplate.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1e1e1e] space-y-3 hover:border-amber-400 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">CodeTwin Telemetry</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Continuous AI radar telemetry identifying exactly which algorithmic patterns (DP, Graphs, Trees) need reinforcement.
                </p>
              </div>
            </div>

            {/* Pricing Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 rounded-3xl border border-[#2d2d2d] bg-[#1a1a1a] space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white">Standard Free</h4>
                  <p className="text-xs text-neutral-400 mt-1">Everything you need to practice coding</p>
                  <div className="text-4xl font-black text-white mt-4">$0 <span className="text-sm font-normal text-neutral-400">/ forever</span></div>
                </div>

                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00b8a3]" /> Access to 3,000+ algorithm challenges</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00b8a3]" /> Standard code execution judge</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00b8a3]" /> Public contest participation & Elo</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#00b8a3]" /> DevArcade minigames (SpeedCoder & ByteSnake)</div>
                </div>

                <Link to="/register" className="block pt-2">
                  <Button variant="outline" className="w-full rounded-full border-[#383838] bg-[#222222] hover:bg-[#2d2d2d] text-white font-bold h-11 text-xs cursor-pointer">
                    Create Free Account
                  </Button>
                </Link>
              </div>

              <div className="p-8 rounded-3xl border-2 border-[#ffa116] bg-[#222222] space-y-6 relative shadow-2xl shadow-[#ffa116]/10">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#ffa116] text-black font-extrabold text-[10px] uppercase tracking-wider">
                  Recommended
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    DevMind Premium
                    <Sparkles className="h-4 w-4 text-[#ffa116]" />
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">The complete technical hiring preparation suite</p>
                  <div className="text-4xl font-black text-[#ffa116] mt-4">$29 <span className="text-sm font-normal text-neutral-400">/ month</span></div>
                </div>

                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ffa116]" /> Everything in Standard Free</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ffa116]" /> 350+ Company-targeted question sets (Google, Meta)</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ffa116]" /> Unlimited InterviewX AI Voice Mock Sessions</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ffa116]" /> Dedicated &lt; 50ms priority execution queue</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ffa116]" /> Cloud DevSim multi-container sandboxes</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#ffa116]" /> ThinkTrace AI deep cognitive diagnostic reports</div>
                </div>

                <Link to="/register" className="block pt-2">
                  <Button className="w-full rounded-full bg-[#ffa116] hover:bg-[#ff9000] text-black font-extrabold h-11 text-xs shadow-lg cursor-pointer">
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: ABOUT DEVMIND AI                              */}
        {/* ======================================================== */}
        <section id="about" className="py-24 bg-[#161616] text-white border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>About DevMind AI</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Go Beyond Rote Syntax. Master Engineering Reasoning.
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  Traditional coding platforms only check whether your output matches a sample string. DevMind AI was built from the ground up to evaluate how engineers actually think, design, debug, and optimize.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#00b8a3]/20 text-[#00b8a3] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Dual-Tier Evaluation Architecture</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Deterministic automated test suite handles correctness while ThinkTrace LLM reviews logical decomposition, edge cases, and algorithmic trade-offs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#ffa116]/20 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">100% Isolated Execution Sandboxes</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Untrusted code is executed inside ephemeral microVMs and isolated Docker containers with non-root privileges, time, and memory limits.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">CodeTwin SkillGraph</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        A dynamic profile that evolves with every submission, pin-pointing your mastery across data structures, system design, and debugging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-[#2d2d2d] space-y-2 text-center">
                  <div className="text-3xl font-extrabold text-[#00b8a3]">3,000+</div>
                  <div className="text-xs font-bold text-white">Curated Quests</div>
                  <p className="text-[11px] text-neutral-400">From Arrays to Distributed DP</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-[#2d2d2d] space-y-2 text-center">
                  <div className="text-3xl font-extrabold text-[#ffa116]">&lt; 0.5s</div>
                  <div className="text-xs font-bold text-white">Judge Feedback</div>
                  <p className="text-[11px] text-neutral-400">Instant isolated execution</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-[#2d2d2d] space-y-2 text-center">
                  <div className="text-3xl font-extrabold text-sky-400">32+</div>
                  <div className="text-xs font-bold text-white">Skill Vectors</div>
                  <p className="text-[11px] text-neutral-400">Comprehensive developer telemetry</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-[#2d2d2d] space-y-2 text-center">
                  <div className="text-3xl font-extrabold text-purple-400">100%</div>
                  <div className="text-xs font-bold text-white">Objective Grading</div>
                  <p className="text-[11px] text-neutral-400">Zero human bias</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: COMPANIES & CAREER PREPARATION                */}
        {/* ======================================================== */}
        <section className="py-20 bg-[#141414] text-white border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#333333] text-xs font-bold text-neutral-300">
                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                <span>Career Preparation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Get Started on Your Dream Engineering Job
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm">
                Practiced by engineers who landed offers at the world's most innovative technology companies.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              {[
                'Google',
                'Meta',
                'Amazon',
                'Apple',
                'Microsoft',
                'Netflix',
                'Uber',
                'Stripe',
                'Bloomberg',
                'Airbnb',
                'Salesforce',
                'Oracle',
              ].map((co) => (
                <div
                  key={co}
                  className="px-5 py-2 rounded-full border border-[#2d2d2d] bg-[#1c1c1c] text-neutral-200 text-xs font-bold hover:border-[#ffa116] hover:text-[#ffa116] transition-colors cursor-default"
                >
                  {co}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 8: DEVELOPER TO BUSINESS (RECRUITER SUITE)       */}
        {/* ======================================================== */}
        <section className="py-20 bg-[#181818] text-white border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-xs font-bold text-sky-400">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>DevMind for Business</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Transform Your Technical Hiring
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Screen candidates objectively on real engineering competency. Automated coding evaluations, isolated judge sandboxes, cognitive anomaly detection, and seamless ATS integration.
                </p>

                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-400 hover:text-sky-300 group"
                  >
                    <span>Business Solutions</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] space-y-2">
                  <div className="text-3xl font-extrabold text-[#ffa116]">85%</div>
                  <h4 className="text-sm font-bold text-white">Screening Time Saved</h4>
                  <p className="text-xs text-neutral-400">Automated candidate ranking with zero human bias.</p>
                </div>

                <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] space-y-2">
                  <div className="text-3xl font-extrabold text-[#00b8a3]">100%</div>
                  <h4 className="text-sm font-bold text-white">Isolated Sandboxes</h4>
                  <p className="text-xs text-neutral-400">Secure execution across Python, C++, Java, and TypeScript.</p>
                </div>

                <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] space-y-2">
                  <div className="text-3xl font-extrabold text-sky-400">32+</div>
                  <h4 className="text-sm font-bold text-white">Skill Vectors</h4>
                  <p className="text-xs text-neutral-400">SkillGraph telemetry mapping data structures and concurrency.</p>
                </div>

                <div className="p-6 rounded-2xl border border-[#2d2d2d] bg-[#1c1c1c] space-y-2">
                  <div className="text-3xl font-extrabold text-purple-400">&lt; 30ms</div>
                  <h4 className="text-sm font-bold text-white">ThinkTrace AI</h4>
                  <p className="text-xs text-neutral-400">Real-time cognitive guidance powered by Gemini Flash.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 9: FINAL CALL TO ACTION                          */}
        {/* ======================================================== */}
        <section className="py-20 bg-[#121212] text-center border-b border-[#2d2d2d]">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Build Skills That Go Beyond The Code.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
              Start understanding your true engineering abilities with an intelligent approach to technical assessment.
            </p>
            <div className="pt-2">
              <Link to="/register">
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] text-black font-black px-8 h-12 text-base shadow-lg shadow-[#ffa116]/20 transition-transform hover:scale-105 cursor-pointer"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;