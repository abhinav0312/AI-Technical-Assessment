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
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'hard':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-[#383838] text-[#9ca3af] border-[#444444]';
    }
  };

  const getScenarioIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'backend_endpoint':
        return <Server className="h-4 w-4 text-sky-400" />;
      case 'sql_optimization':
        return <Database className="h-4 w-4 text-[#ffa116]" />;
      default:
        return <Terminal className="h-4 w-4 text-[#ffa116]" />;
    }
  };

  return (
    <div className="space-y-8 pb-16 text-[#eff2f6] font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#383838]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
              <Layers className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-[#ffa116]">
              Realistic Systems Simulation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#ffffff] flex items-center gap-3">
            DevSim Engineering Scenarios
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] border border-[#383838] text-[#9ca3af] font-mono font-normal">
              Multi-File Sandboxes
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 max-w-2xl leading-relaxed">
            Tackle realistic software engineering tasks in isolated project environments. Navigate multi-file source trees, run live test suites, and receive advisory AI code reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchScenarios}
            className="gap-1.5 text-xs text-[#ffffff] border-[#383838] bg-[#1e1e1e] hover:bg-[#333333] hover:text-[#ffa116] font-semibold"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh Scenarios
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-[#383838] bg-[#262626] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-[#ffa116] font-bold text-sm">
            <Sparkles className="h-4 w-4 text-[#ffa116]" />
            Production-Style Codebases & Real Sandbox Execution
          </div>
          <p className="text-xs sm:text-sm text-[#d1d5db] leading-relaxed">
            Unlike simple single-function coding tests, DevSim tasks mirror day-to-day engineering: multi-file architecture, business requirements, regression safety tests, and real terminal diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#383838] text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Isolation</span>
            <span className="text-xs font-mono font-bold text-[#00b8a3]">Sandboxed</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#383838] text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">Review</span>
            <span className="text-xs font-mono font-bold text-[#ffa116]">ThinkTrace AI</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#383838] bg-[#262626] shadow-sm">
        {/* Scenario Type Pills */}
        <div className="flex flex-wrap gap-1.5">
          {scenarioTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedType === type.id
                  ? 'bg-[#ffa116] text-black shadow-sm font-extrabold'
                  : 'bg-[#1e1e1e] border border-[#383838] text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#333333]'
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#9ca3af]" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-[#383838] bg-[#1e1e1e] px-3 py-1.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffa116] cursor-pointer"
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
            <div key={i} className="h-44 rounded-xl border border-[#383838] bg-[#262626] p-5 animate-pulse" />
          ))}
        </div>
      ) : filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScenarios.map((sc) => (
            <div
              key={sc.id}
              className="rounded-xl border border-[#383838] bg-[#262626] p-5 flex flex-col justify-between space-y-4 hover:border-[#ffa116]/50 transition-all group shadow-md"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(sc.scenario_type)}
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#d1d5db]">
                      {sc.scenario_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getDifficultyColor(
                      sc.difficulty
                    )}`}
                  >
                    {sc.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#ffffff] group-hover:text-[#ffa116] transition-colors">
                  {sc.title}
                </h3>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sc.relevant_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#9ca3af] font-mono"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#383838]">
                <span className="text-[11px] text-[#9ca3af] flex items-center gap-1.5 font-medium">
                  <FileCheck2 className="h-3.5 w-3.5 text-[#00b8a3]" />
                  Isolated Sandbox Environment
                </span>
                <Link to={`/dashboard/devsim/${sc.slug}`}>
                  <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#ffa116] hover:bg-[#f59e0b] text-black font-extrabold shadow-sm">
                    Open Workspace <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#383838] bg-[#262626] p-12 text-center space-y-3">
          <Layers className="h-8 w-8 text-[#9ca3af] mx-auto" />
          <h3 className="text-base font-bold text-[#ffffff]">No engineering scenarios found</h3>
          <p className="text-xs text-[#9ca3af]">
            Try adjusting your filter selection.
          </p>
        </div>
      )}
    </div>
  );
}

export default DevSimPage;
