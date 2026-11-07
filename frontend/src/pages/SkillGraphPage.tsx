import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { SkillGraphResponse } from '@/types/skillgraph';
import { SkillGraphCanvas } from '@/features/skillgraph/SkillGraphCanvas';
import { SkillDetailPanel } from '@/features/skillgraph/SkillDetailPanel';
import {
  GitFork,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Percent,
  Search,
  RotateCw,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SkillGraphPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [graphData, setGraphData] = useState<SkillGraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and state
  const [selectedSkillSlug, setSelectedSkillSlug] = useState<string | null>(
    searchParams.get('skill') || null
  );
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [masteryFilter, setMasteryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchGraphData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<SkillGraphResponse>('/skillgraph/graph');
      setGraphData(data);
    } catch (err: any) {
      console.error('Failed to load SkillGraph:', err);
      setError(err?.message || 'Failed to load skill graph. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Synchronize URL search params with selected skill
  const handleSelectSkill = (slug: string) => {
    setSelectedSkillSlug(slug);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('skill', slug);
      return next;
    });
  };

  const handleCloseDetail = () => {
    setSelectedSkillSlug(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('skill');
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
          <GitFork className="h-5 w-5 text-brand-400 absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Synthesizing Skill Progress Map</h3>
          <p className="text-xs text-slate-500">
            Correlating verified evidence across Coding Arena, BugHunter, and diagnostic assessments...
          </p>
        </div>
      </div>
    );
  }

  if (error || !graphData) {
    const isAuthError =
      error?.toLowerCase().includes('credential') ||
      error?.toLowerCase().includes('session') ||
      error?.toLowerCase().includes('unauthorized') ||
      error?.toLowerCase().includes('401');

    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        {isAuthError ? (
          <>
            <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
              <GitFork className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sign In to Access Your SkillGraph</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your verified skill graph and evidence traces are personalized to your assessments and code history.
            </p>
            <Button onClick={() => (window.location.href = '/login')} className="gap-2">
              Sign In to Continue
            </Button>
          </>
        ) : (
          <>
            <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Error Loading Skill Progress</h3>
            <p className="text-xs text-slate-500">{error || 'An unexpected error occurred.'}</p>
            <Button onClick={fetchGraphData} className="gap-2">
              <RotateCw className="h-4 w-4" /> Retry Loading
            </Button>
          </>
        )}
      </div>
    );
  }

  const { summary, domains, nodes, edges, version } = graphData;

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] -m-6 overflow-hidden bg-[#FAFAFC]">
      {/* Top Header & Metrics Dashboard */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shrink-0 space-y-3.5 shadow-xs">
        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-xs">
              <GitFork className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Skill Progress Map</h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Taxonomy v{version}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">· Verified Evidence</span>
              </div>
              <p className="text-xs text-slate-500">
                Hierarchical proficiency map synthesizing verified code execution and diagnostic sessions.
              </p>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGraphData}
              className="h-8 gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-200"
            >
              <RotateCw className="h-3.5 w-3.5" /> Refresh Evidence
            </Button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {/* Total Skills */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-brand-600">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Total Skills</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{summary.total_skills}</span>
            </div>
          </div>

          {/* Mastered */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Mastered (≥3 obs)</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {summary.mastered_count}
              </span>
            </div>
          </div>

          {/* Proficient */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Proficient</span>
              <span className="text-sm font-bold text-cyan-700 font-mono">
                {summary.proficient_count}
              </span>
            </div>
          </div>

          {/* Developing */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Developing</span>
              <span className="text-sm font-bold text-amber-700 font-mono">
                {summary.developing_count}
              </span>
            </div>
          </div>

          {/* Unassessed */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Unassessed</span>
              <span className="text-sm font-bold text-slate-700 font-mono">
                {summary.unassessed_count}
              </span>
            </div>
          </div>

          {/* Overall Proficiency */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Avg Proficiency</span>
              <span className="text-sm font-bold text-brand-700 font-mono">
                {Math.round(
                  summary.overall_proficiency <= 1.0 && summary.overall_proficiency > 0
                    ? summary.overall_proficiency * 100
                    : summary.overall_proficiency
                )}%
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          {/* Domain Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
              Domain:
            </span>
            <button
              onClick={() => setDomainFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                domainFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              All ({summary.total_skills})
            </button>
            {domains.map((d) => (
              <button
                key={d.key}
                onClick={() => setDomainFilter(d.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  domainFilter === d.key
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {d.label} ({d.count})
              </button>
            ))}
          </div>

          {/* Mastery Status Pills & Search */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Status filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {(['all', 'mastered', 'proficient', 'developing', 'unassessed'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMasteryFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] capitalize font-medium transition-all ${
                    masteryFilter === lvl
                      ? 'bg-white text-brand-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-48">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Find skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace (Canvas + Docked Detail Panel) */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Interactive Canvas Graph */}
        <div className="flex-1 h-full p-3">
          <SkillGraphCanvas
            nodes={nodes}
            edges={edges}
            selectedSkillSlug={selectedSkillSlug}
            onSelectSkill={handleSelectSkill}
            domainFilter={domainFilter}
            masteryFilter={masteryFilter}
            searchQuery={searchQuery}
          />
        </div>

        {/* Docked Skill Detail Panel (when a skill is clicked) */}
        {selectedSkillSlug && (
          <SkillDetailPanel
            skillSlug={selectedSkillSlug}
            onClose={handleCloseDetail}
            onSelectSkill={handleSelectSkill}
          />
        )}
      </div>
    </div>
  );
}
