import { BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsPage() {
  const dimensions = [
    { label: 'Algorithmic Complexity & Optimization', score: 94, benchmark: '92% of peers', color: 'bg-emerald-500' },
    { label: 'System Architecture & Boundary Resilience', score: 88, benchmark: '85% of peers', color: 'bg-brand-500' },
    { label: 'Concurrency, Queues & Threading', score: 91, benchmark: '89% of peers', color: 'bg-indigo-500' },
    { label: 'Memory Safety & Resource Management', score: 82, benchmark: '76% of peers', color: 'bg-purple-500' },
    { label: 'Refactoring & Clean Code Patterns', score: 95, benchmark: '94% of peers', color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="pb-4 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-brand-400" />
          SkillGraph Analytics & Cognition
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed cognitive vector breakdown derived from live test sessions and architectural challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border/70 bg-surface-card">
          <div className="text-xs text-muted-foreground">Composite Engineering Index</div>
          <div className="text-3xl font-extrabold text-white mt-1">90.2</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Top 5th Percentile Global</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/70 bg-surface-card">
          <div className="text-xs text-muted-foreground">Decomposition Velocity</div>
          <div className="text-3xl font-extrabold text-white mt-1">1.8x</div>
          <div className="text-[11px] text-brand-300 mt-1">Faster than median candidate</div>
        </div>

        <div className="p-5 rounded-xl border border-border/70 bg-surface-card">
          <div className="text-xs text-muted-foreground">Error Recovery Resilience</div>
          <div className="text-3xl font-extrabold text-white mt-1">96%</div>
          <div className="text-[11px] text-indigo-300 mt-1">Fixed edge failures on first attempt</div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border/70 bg-surface-card space-y-6">
        <h2 className="text-base font-bold text-white">Competency Breakdown</h2>

        <div className="space-y-5">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{dim.label}</span>
                <span className="font-mono text-brand-300 font-bold">{dim.score}/100</span>
              </div>
              <div className="h-2.5 w-full bg-surface-darkest rounded-full overflow-hidden border border-border/40">
                <div className={`h-full ${dim.color} rounded-full`} style={{ width: `${dim.score}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground flex justify-between">
                <span>Benchmark: {dim.benchmark}</span>
                <span className="text-emerald-400 font-medium">Verified via sandbox tests</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
