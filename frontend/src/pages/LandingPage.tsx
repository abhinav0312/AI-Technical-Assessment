import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  Terminal,
  Cpu,
  Brain,
  Code2,
  GitBranch,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36">
          {/* Ambient background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-xs font-semibold text-brand-300 backdrop-blur-sm animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                <span>Next-Gen Engineering Intelligence & Technical Assessment</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Evaluate Real Engineering Aptitude,{' '}
                <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Not Syntactic Memorization.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                DevMind AI observes how software engineers think, architect systems under constraints,
                diagnose production incidents, and write modular, performant code.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2 shadow-lg shadow-brand-500/25">
                    Start Candidate Sandbox
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/challenges">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Terminal className="h-4 w-4 text-brand-400" />
                    Explore Challenges
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-white">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Live Metric Badges */}
              <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground border-t border-border/40 mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Argon2id Secure Auth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Real-time Isolated Code Runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Cognitive Process Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Multi-Language Sandboxes (Python, TS, Go, Rust)</span>
                </div>
              </div>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="mt-14 max-w-5xl mx-auto rounded-xl border border-border/80 bg-surface-card/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-muted-foreground">devmind-sandbox-session // sliding-window-rate-limiter</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Cognitive Trace
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Code Panel */}
                <div className="bg-surface-darkest p-4 rounded-lg border border-border/40 overflow-x-auto text-slate-300">
                  <div className="text-muted-foreground pb-2 text-[11px] border-b border-border/30 mb-2">
                    // Solution: rate_limiter.py
                  </div>
                  <pre className="text-slate-300">
{`from collections import deque
import time

class RateLimiter:
    def __init__(self, max_requests: int, window_sec: float):
        self.max = max_requests
        self.window = window_sec
        self.clients: dict[str, deque[float]] = {}

    def allow_request(self, client_id: str, ts: float) -> bool:
        q = self.clients.setdefault(client_id, deque())
        while q and q[0] <= ts - self.window:
            q.popleft()
        if len(q) < self.max:
            q.append(ts)
            return True
        return False`}
                  </pre>
                </div>

                {/* Diagnostics / Intelligence Panel */}
                <div className="bg-surface-darkest p-4 rounded-lg border border-border/40 flex flex-col justify-between">
                  <div>
                    <div className="text-muted-foreground pb-2 text-[11px] border-b border-border/30 mb-3 flex justify-between">
                      <span>DevMind Cognitive Telemetry</span>
                      <span className="text-brand-300 font-sans">Score: 94/100</span>
                    </div>

                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>Algorithmic Optimality (O(1) Amortized)</span>
                          <span className="text-emerald-400 font-semibold">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>Edge Boundary Resilience</span>
                          <span className="text-brand-400 font-semibold">92%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full w-[92%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span>Memory Cleanup Under Concurrency</span>
                          <span className="text-indigo-400 font-semibold">89%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-dark rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-[89%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/30 text-[11px] font-sans text-muted-foreground">
                    ⚡ Observation: Candidate proactively recognized potential memory leakage for dormant client IDs and added monotonic time boundary eviction.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars Section */}
        <section id="pillars" className="py-24 border-t border-border/50 bg-surface-darkest/40">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
                Systemic Evaluation
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                The Four Pillars of DevMind Intelligence
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Traditional platforms test if code compiles. DevMind measures engineering discernment,
                problem decomposition, and architectural agility.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 rounded-xl border border-border/60 bg-surface-card hover:border-brand-500/40 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">Pillar 01</div>
                <h3 className="text-lg font-bold text-white mb-2">THINK</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tracks problem decomposition, hypothesis exploration, and debugging strategies rather than just final code output.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-xl border border-border/60 bg-surface-card hover:border-brand-500/40 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Code2 className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Pillar 02</div>
                <h3 className="text-lg font-bold text-white mb-2">CODE</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time interactive code arena with multi-language execution, zero latency test runner, and strict sandbox safety.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-xl border border-border/60 bg-surface-card hover:border-brand-500/40 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">Pillar 03</div>
                <h3 className="text-lg font-bold text-white mb-2">BUILD</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Realistic multi-file architecture challenges: refactor legacy systems, implement microservices, and design concurrent queues.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 rounded-xl border border-border/60 bg-surface-card hover:border-brand-500/40 transition-all duration-300 group">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Pillar 04</div>
                <h3 className="text-lg font-bold text-white mb-2">GROW</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SkillGraph engine mapping mastery across systems engineering, data structures, concurrency, and security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow / Architecture */}
        <section id="workflow" className="py-24 border-t border-border/50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
                Under the Hood
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Enterprise-Grade Engineering Architecture
              </h2>
              <p className="text-muted-foreground text-sm">
                Built on modern primitives: FastAPI async backend, SQL model schemas, Argon2id cryptography, and a reactive Vite frontend.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-border/60 bg-surface-card space-y-3">
                <ShieldCheck className="h-8 w-8 text-brand-400" />
                <h3 className="text-lg font-semibold text-white">Defense-in-Depth Security</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Rigorous password hashing using Argon2id, JWT bearer token revocation, strict CORS origin controls, and sanitized error responses.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/60 bg-surface-card space-y-3">
                <Cpu className="h-8 w-8 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Async Event-Driven Core</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SQLAlchemy 2.0 with native async/await connection pooling, background test execution pipelines, and non-blocking proxying.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border/60 bg-surface-card space-y-3">
                <GitBranch className="h-8 w-8 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Role-Based Multi-Tenancy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Custom privilege levels for Candidates, Challenge Creators, Recruiters, and Administrators with isolated scopes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
