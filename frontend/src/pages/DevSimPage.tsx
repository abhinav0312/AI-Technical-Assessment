import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { DevSimScenarioSummary } from '@/types/devsim';
import {
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  RotateCw,
  Server,
  Database,
  FileCheck2,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DevSimPage() {
  const [scenarios, setScenarios] = useState<DevSimScenarioSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const fetchScenarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<DevSimScenarioSummary[]>('/devsim/scenarios');
      setScenarios(data || []);
    } catch (err) {
      console.error('Failed to load DevSim scenarios:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const scenarioTypes = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'backend_endpoint', label: 'Backend APIs' },
    { id: 'sql_optimization', label: 'SQL Optimization' },
    { id: 'regression_fix', label: 'Regression Fixing' },
    { id: 'performance', label: 'Performance' },
  ];

  const filteredScenarios = scenarios.filter((s) => {
    const matchType =
      selectedType === 'all' ||
      s.scenario_type.toLowerCase() === selectedType.toLowerCase();
    const matchDiff =
      selectedDifficulty === 'all' ||
      s.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchType && matchDiff;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getScenarioIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'backend_endpoint':
        return <Server className="h-4 w-4 text-sky-400" />;
      case 'sql_optimization':
        return <Database className="h-4 w-4 text-amber-400" />;
      default:
        return <Terminal className="h-4 w-4 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Layers className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
              Realistic Engineering Assessment
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            DevSim Engineering Scenarios
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-dark border border-border text-muted-foreground font-mono font-normal">
              Multi-File Sandboxes
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Tackle realistic software engineering tasks in isolated project environments. Navigate source repositories, run real test suites, and receive advisory AI code reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchScenarios}
            className="gap-1.5 text-xs text-muted-foreground hover:text-white"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/20 via-surface-card to-surface-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
            <Sparkles className="h-4 w-4 text-teal-400" />
            Production-Style Codebases & Real Execution
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike simple single-function coding tests, DevSim tasks mirror day-to-day engineering: multi-file architecture, business requirements, regression safety tests, and production log diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-3 rounded-xl bg-surface-darkest border border-border/60 text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Isolation</span>
            <span className="text-xs font-mono font-bold text-teal-400">Sandboxed</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-darkest border border-border/60 text-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Review</span>
            <span className="text-xs font-mono font-bold text-brand-300">Advisory AI</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-surface-card">
        {/* Scenario Type Pills */}
        <div className="flex flex-wrap gap-1">
          {scenarioTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedType === type.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-surface-dark hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-border/70 bg-surface-darkest px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Scenario Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-xl border border-border/40 bg-surface-card p-5 animate-pulse" />
          ))}
        </div>
      ) : filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              className="rounded-xl border border-border/70 bg-surface-card p-5 flex flex-col justify-between space-y-4 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/5 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(sc.scenario_type)}
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-darkest border border-border/60 text-slate-300">
                      {sc.scenario_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getDifficultyColor(
                      sc.difficulty
                    )}`}
                  >
                    {sc.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {sc.title}
                </h3>

                <div className="flex flex-wrap gap-1">
                  {sc.relevant_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.2 rounded bg-surface-darkest text-muted-foreground"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <FileCheck2 className="h-3.5 w-3.5 text-teal-400" />
                  Isolated Sandbox Environment
                </span>
                <Link to={`/dashboard/devsim/${sc.slug}`}>
                  <Button size="sm" className="h-8 text-xs gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold">
                    Open Workspace <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-surface-card p-12 text-center space-y-2">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-white">No engineering scenarios found</h3>
          <p className="text-xs text-muted-foreground">
            Try adjusting your filter selection.
          </p>
        </div>
      )}
    </div>
  );
}

export default DevSimPage;
