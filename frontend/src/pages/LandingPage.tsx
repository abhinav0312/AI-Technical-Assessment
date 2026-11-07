import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Code2,
  Bug,
  GitFork,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  Check,
  Briefcase,
  Users,
} from 'lucide-react';

export function LandingPage() {
  // State for interactive demo section
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

  const handleRunDemoTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setDemoTab('tests');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-brand-500/15 selection:text-brand-900">
      <Navbar />

      <main className="flex-1">
        {/* ======================================================== */}
        {/* SECTION B: HERO SECTION                                  */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#FAFAFC] to-[#F1F5F9]/50">
          {/* Subtle dotted background */}
          <div className="absolute inset-0 dev-grid-bg opacity-70 pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-xs font-semibold text-brand-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                <span>Next-Gen Engineering Assessment Platform</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
                Go Beyond Coding.{' '}
                <span className="text-brand-600 block sm:inline">
                  Understand Your Engineering Skills.
                </span>
              </h1>

              {/* Exact Requested Description */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
                An intelligent technical assessment platform that helps developers demonstrate their abilities,
                understand their weaknesses, and become better engineers through AI-powered evaluation.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <Link to="/register">
                  <Button size="lg" className="gap-2 shadow-xs text-base px-6 h-12 font-medium">
                    Start Practicing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button variant="outline" size="lg" className="gap-2 text-base px-6 h-12 text-slate-700 font-medium">
                    <Code2 className="h-4 w-4 text-brand-600" />
                    Explore Platform
                  </Button>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Real-Time Code Execution</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>ThinkTrace AI Feedback</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Visual Skill Tree</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Python & TypeScript</span>
                </div>
              </div>
            </div>

            {/* Realistic DevMind AI Dashboard Preview */}
            <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-7 shadow-xl shadow-slate-900/5">
              {/* Window chrome bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <span className="ml-2 font-mono text-slate-400 text-[11px]">devmind.app // engineering-workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Assessment Active
                  </span>
                </div>
              </div>

              {/* Inner Dashboard Layout Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left 2 Cols: Challenge & Code Summary */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Active Challenge Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          System Design
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Medium
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">Solved • 12/12 Tests Passing</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      Sliding Window Rate Limiter
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      Design an in-memory Sliding Window Rate Limiter that evaluates requests per client against a fixed time window.
                    </p>
                  </div>

                  {/* Code Snippet Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
                      <span>solution.py</span>
                      <span className="text-emerald-400 font-sans">0.4ms avg runtime</span>
                    </div>
                    <pre className="text-slate-300">
{`def allow_request(self, client_id: str, ts: float) -> bool:
    times = self.clients.setdefault(client_id, [])
    cutoff = ts - self.window
    self.clients[client_id] = [t for t in times if t > cutoff]
    if len(self.clients[client_id]) < self.max:
        self.clients[client_id].append(ts)
        return True
    return False`}
                    </pre>
                  </div>

                  {/* AI Feedback Bar */}
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-brand-600 text-white shrink-0 mt-0.5">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-brand-900 flex items-center gap-2">
                        <span>ThinkTrace AI Feedback</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-100 text-brand-800 font-normal">
                          Complexity: O(N)
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                        Clean timestamp boundary enforcement. Proactively cleans up dormant request logs under concurrent load.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Skill Overview & Progress Metrics */}
                <div className="space-y-4">
                  {/* Skill Progress Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skill Proficiency</h4>
                      <span className="text-xs font-bold text-brand-600">88% Overall</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>System Architecture</span>
                          <span className="font-semibold text-slate-900">92%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-600 rounded-full w-[92%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Concurrency & Threads</span>
                          <span className="font-semibold text-slate-900">88%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full w-[88%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Data Structures</span>
                          <span className="font-semibold text-slate-900">94%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full w-[94%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Debugging & Resilience</span>
                          <span className="font-semibold text-slate-900">85%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full w-[85%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                      <div className="text-[11px] text-slate-500">Challenges Solved</div>
                      <div className="text-lg font-bold text-slate-900">12</div>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                      <div className="text-[11px] text-slate-500">Percentile</div>
                      <div className="text-lg font-bold text-emerald-600">Top 8%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION C: PRODUCT WORKFLOW                              */}
        {/* ======================================================== */}
        <section id="workflow" className="py-20 lg:py-28 border-b border-slate-200/80 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                A Smarter 4-Stage Learning & Assessment Flow
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Traditional tests only check if code compiles. DevMind AI evaluates how you analyze, construct, and refine technical solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stage 01 */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-brand-600 transition-colors">
                    STAGE 01
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">01 THINK</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Understand and explain your problem-solving approach. Clarify boundary constraints and propose algorithmic complexity.
                </p>
              </div>

              {/* Stage 02 */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                    STAGE 02
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">02 CODE</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Solve programming problems in Python or TypeScript and receive reliable, zero-latency evaluation against real test suites.
                </p>
              </div>

              {/* Stage 03 */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    <Bug className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-amber-600 transition-colors">
                    STAGE 03
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">03 BUILD</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Work on realistic engineering challenges and fix real production bugs rather than repeating toy algorithmic puzzles.
                </p>
              </div>

              {/* Stage 04 */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAFC] hover:border-brand-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    <GitFork className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                    STAGE 04
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">04 GROW</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Understand your strengths and improve your technical abilities with interactive visual skill graphs and targeted feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION D: FEATURE SHOWCASE (4 Core, Streamlined Pillars) */}
        {/* ======================================================== */}
        <section id="features" className="py-20 lg:py-28 border-b border-slate-200/80 bg-[#FAFAFC]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-24">
            {/* Feature 1: Coding Arena */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-700 border border-brand-200 text-xs font-semibold">
                  <Code2 className="h-3.5 w-3.5" />
                  Coding Arena
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Solve Real Engineering Problems with Fast, Isolated Feedback
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Practice on challenges spanning distributed systems, concurrency, memory safety, and algorithmic optimization.
                </p>
                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Instant isolated test runner supporting Python and TypeScript</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Automated test assertion checks, edge cases, and runtime profiling</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Draft auto-saving so you never lose your problem-solving state</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/challenges">
                    <Button className="gap-2">
                      Explore Challenge Catalog
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Feature 1 Visual Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">Problem Catalog</span>
                  <span>Filtered by: System Design</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Sliding Window Rate Limiter</div>
                      <div className="text-[11px] text-slate-500">Queue Operations & Concurrency</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Medium
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Distributed LRU Cache Eviction</div>
                      <div className="text-[11px] text-slate-500">Hash Maps & Doubly Linked Lists</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Hard
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Two Sum Target Pair</div>
                      <div className="text-[11px] text-slate-500">Array Bounds & Complements</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Easy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: ThinkTrace AI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Feature 2 Visual Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md order-2 lg:order-1">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Brain className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-semibold text-slate-900">Cognitive Reasoning Trace</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">PROPOSED TIME COMPLEXITY</span>
                    <span className="font-mono text-emerald-600 font-bold">O(1) Amortized</span>
                    <p className="text-slate-600 text-[11px] mt-1">Confirmed via constant-time timestamp lookups.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">EDGE CASES IDENTIFIED</span>
                    <span className="text-slate-800 font-medium">Dormant client memory leak protection</span>
                    <p className="text-slate-600 text-[11px] mt-1">Demonstrated proactive cleanup for inactive users.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  <Brain className="h-3.5 w-3.5" />
                  ThinkTrace AI
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Transparent Evaluation of How You Reason
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Anyone can copy syntactical solutions. ThinkTrace tracks how you structure hypotheses, evaluate trade-offs, and handle constraints.
                </p>
                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Explains theoretical complexity vs measured benchmark performance</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Constructive feedback on code modularity and maintainability</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Tracks revision history across iterations as you optimize</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/register">
                    <Button variant="outline" className="gap-2">
                      Try ThinkTrace Evaluation
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature 3: BugHunter */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Bug className="h-3.5 w-3.5" />
                  BugHunter
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Master Debugging on Broken Production Code
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Real engineering is 70% reading and fixing existing systems. BugHunter places you directly in front of flawed codebases to locate and fix silent regressions.
                </p>
                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Fix concurrency deadlocks, off-by-one errors, and memory leaks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Analyze stack traces, failed assertions, and telemetry</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Earn verified debugging and incident mitigation badges</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/bughunter">
                    <Button className="gap-2">
                      Open BugHunter Arena
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Feature 3 Visual Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-semibold text-slate-800">Incident #INC-402</span>
                  </div>
                  <span className="text-rose-600 font-mono text-[11px]">RaceConditionDetected</span>
                </div>
                <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/60 text-xs text-rose-900 mb-3">
                  AssertionError: Counter yielded 98 instead of 100 under 10 concurrent threads. Missing mutex lock.
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-900 text-slate-300 font-mono text-[11px]">
                  <code>{`# Fix: add lock guard\nwith self._lock:\n    self._counter += 1`}</code>
                </div>
              </div>
            </div>

            {/* Feature 4: SkillGraph */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Feature 4 Visual Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md order-2 lg:order-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-brand-600" />
                    <span className="font-semibold text-slate-800">Interactive Skill Tree</span>
                  </div>
                  <span className="text-brand-600 text-[11px] font-medium">8 Verified Nodes</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">★ Mastered</span>
                    <span className="font-semibold text-slate-900">Hash Maps & Arrays</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">96% score</span>
                  </div>
                  <div className="p-3 rounded-lg border border-cyan-200 bg-cyan-50">
                    <span className="text-[10px] font-bold text-cyan-800 uppercase block">✓ Proficient</span>
                    <span className="font-semibold text-slate-900">Concurrency Locks</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">88% score</span>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">⚡ Developing</span>
                    <span className="font-semibold text-slate-900">Memory Eviction</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">74% score</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">? Prerequisite</span>
                    <span className="font-semibold text-slate-900">Distributed Consensus</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Unlocked next</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <GitFork className="h-3.5 w-3.5" />
                  SkillGraph
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Visual Mastery Maps Instead of Abrasive Rejection Letters
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Never guess where you stand. SkillGraph clearly highlights your validated competencies, prerequisite paths, and recommended next steps.
                </p>
                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Visual prerequisite tree mapping dependencies between technical skills</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Dynamic proficiency ratings backed by code execution telemetry</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>Direct challenge recommendations to target specific growth areas</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link to="/dashboard/skillgraph">
                    <Button variant="outline" className="gap-2">
                      Explore SkillGraph
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION E: INTERACTIVE PRODUCT DEMONSTRATION             */}
        {/* ======================================================== */}
        <section id="demo" className="py-20 lg:py-28 border-b border-slate-200/80 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                Interactive Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Try the Assessment Environment
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Click below to switch between the problem description, code editor, test runner, and AI evaluation report.
              </p>
            </div>

            {/* Interactive Demo Container */}
            <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {/* Top toolbar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50 gap-2">
                {/* Tabs */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDemoTab('problem')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      demoTab === 'problem'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1. Problem Spec
                  </button>
                  <button
                    onClick={() => setDemoTab('code')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      demoTab === 'code'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2. Code Editor
                  </button>
                  <button
                    onClick={() => setDemoTab('tests')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      demoTab === 'tests'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>3. Test Results</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </button>
                  <button
                    onClick={() => setDemoTab('ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      demoTab === 'ai'
                        ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Brain className="h-3.5 w-3.5 text-brand-600" />
                    <span>4. AI Feedback</span>
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={demoLang}
                    onChange={(e) => setDemoLang(e.target.value as any)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="python">Python 3.12</option>
                    <option value="typescript">TypeScript 5.x</option>
                  </select>

                  <Button
                    size="sm"
                    onClick={handleRunDemoTests}
                    isLoading={isRunningTests}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Run Tests
                  </Button>
                </div>
              </div>

              {/* Dynamic Content Body */}
              <div className="p-6">
                {demoTab === 'problem' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">Sliding Window Rate Limiter</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Medium
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Implement a rate limiter class that accepts a maximum request count and time window in seconds.
                      Subsequent calls to <code>allow_request(client_id, timestamp)</code> must strictly allow or reject requests
                      according to whether the client has exceeded the threshold in the preceding window.
                    </p>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs font-mono">
                      <div className="text-slate-500 font-sans font-semibold">Example:</div>
                      <div>limiter = RateLimiter(max_reqs=2, window_sec=60)</div>
                      <div>limiter.allow_request("user1", 1.0) # True</div>
                      <div>limiter.allow_request("user1", 2.0) # True</div>
                      <div>limiter.allow_request("user1", 3.0) # False (exceeded)</div>
                      <div>limiter.allow_request("user1", 62.0) # True (window reset)</div>
                    </div>
                  </div>
                )}

                {demoTab === 'code' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100 overflow-x-auto leading-relaxed shadow-inner">
                      <pre className="text-slate-200">
                        {demoLang === 'python' ? pythonDemoCode : tsDemoCode}
                      </pre>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Monaco Code Engine • Syntactic validation active</span>
                      <Button variant="ghost" size="sm" onClick={handleRunDemoTests} className="text-brand-600 text-xs">
                        Execute against test suite →
                      </Button>
                    </div>
                  </div>
                )}

                {demoTab === 'tests' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">Test Execution Results</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        3/3 Passing (100%)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900">Test 1: Single client basic window burst</span>
                        </div>
                        <span className="text-emerald-700 font-mono text-[11px]">Passed (1.2ms)</span>
                      </div>

                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900">Test 2: Multiple concurrent client isolation</span>
                        </div>
                        <span className="text-emerald-700 font-mono text-[11px]">Passed (2.0ms)</span>
                      </div>

                      <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900">Test 3: Window boundary sliding expiration</span>
                        </div>
                        <span className="text-emerald-700 font-mono text-[11px]">Passed (1.8ms)</span>
                      </div>
                    </div>
                  </div>
                )}

                {demoTab === 'ai' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-brand-600" />
                          <span className="text-xs font-bold text-brand-900">DevMind Cognitive Evaluation</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-600 text-white">
                          Score: 94/100
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Excellent architectural discernment. The candidate properly addressed timestamp expiration without unbounded memory expansion.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-slate-500 font-medium block mb-1">Time Complexity</span>
                        <span className="font-bold text-slate-900 text-sm">O(K)</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">K = requests in window</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-slate-500 font-medium block mb-1">Space Complexity</span>
                        <span className="font-bold text-slate-900 text-sm">O(N × K)</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Bounded memory state</span>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-slate-500 font-medium block mb-1">Resilience Check</span>
                        <span className="font-bold text-emerald-600 text-sm">Passed</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">No memory leaks</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION F: WHO IS IT FOR? (Dual Audience)                */}
        {/* ======================================================== */}
        <section id="audience" className="py-20 lg:py-28 border-b border-slate-200/80 bg-[#FAFAFC]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                Tailored Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Designed for Developers and Engineering Teams
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Whether you're polishing your own engineering abilities or assessing top technical talent, DevMind provides clear, objective insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* For Developers */}
              <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center font-bold">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">For Developers</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Build real confidence across systems engineering, distributed architecture, and debugging with actionable feedback.
                  </p>

                  <div className="space-y-3 pt-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Improve real-world coding and debugging skills</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Identify your technical weaknesses and knowledge gaps</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Practice under realistic technical interview conditions</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Track personal progress with interactive skill trees</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link to="/register" className="block">
                    <Button className="w-full">Start as a Developer</Button>
                  </Link>
                </div>
              </div>

              {/* For Recruiters & Engineering Teams */}
              <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">For Engineering Leaders</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Screen for actual engineering competence rather than memorized LeetCode answers with calibrated benchmarks.
                  </p>

                  <div className="space-y-3 pt-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>Create objective, standardized technical assessments</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>Evaluate candidate problem-solving and architectural discernment</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>Compare technical performance across structured rubrics</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                      <span>Review AI-generated diagnostic reports with zero bias</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link to="/register" className="block">
                    <Button variant="outline" className="w-full">Screen Candidates</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION G: FINAL CTA                                     */}
        {/* ======================================================== */}
        <section className="py-20 lg:py-24 bg-brand-600 text-white relative overflow-hidden">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Build Skills That Go Beyond the Code.
            </h2>
            <p className="text-brand-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Start understanding your engineering abilities with a smarter approach to technical assessment.
            </p>
            <div className="pt-2">
              <Link to="/register">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 h-12 px-8 font-semibold shadow-lg text-base">
                  Get Started
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
