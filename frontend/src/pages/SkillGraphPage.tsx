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
          <div className="h-12 w-12 rounded-full border-4 border-[#ffa116]/20 border-t-[#ffa116] animate-spin" />
          <GitFork className="h-5 w-5 text-[#ffa116] absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-[#ffffff]">Synthesizing Skill Progress Map</h3>
          <p className="text-xs text-[#9ca3af]">
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
      <div className="p-8 max-w-xl mx-auto my-12 bg-[#262626] border border-[#383838] rounded-2xl text-center space-y-4 shadow-sm text-[#eff2f6]">
        {isAuthError ? (
          <>
            <div className="h-12 w-12 rounded-2xl bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center mx-auto">
              <GitFork className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#ffffff]">Sign In to Access Your SkillGraph</h3>
            <p className="text-xs text-[#cbd5e1] max-w-sm mx-auto">
              Your verified skill graph and evidence traces are personalized to your assessments and code history.
            </p>
            <Button onClick={() => (window.location.href = '/login')} className="gap-2 bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold">
              Sign In to Continue
            </Button>
          </>
        ) : (
          <>
            <AlertTriangle className="h-10 w-10 text-[#ff375f] mx-auto" />
            <h3 className="text-lg font-bold text-[#ffffff]">Error Loading Skill Progress</h3>
            <p className="text-xs text-[#9ca3af]">{error || 'An unexpected error occurred.'}</p>
            <Button onClick={fetchGraphData} className="gap-2 bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold">
              <RotateCw className="h-4 w-4" /> Retry Loading
            </Button>
          </>
        )}
      </div>
    );
  }

  const { summary, domains, nodes, edges, version } = graphData;

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] -m-6 overflow-hidden bg-[#1a1a1a]">
      {/* Top Header & Metrics Dashboard */}
      <div className="border-b border-[#383838] bg-[#262626] px-6 py-4 shrink-0 space-y-3.5 shadow-sm">
        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#ffa116] text-black flex items-center justify-center shadow-xs">
              <GitFork className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#ffffff] tracking-tight">Skill Progress Map</h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/30">
                  Taxonomy v{version}
                </span>
                <span className="text-[10px] text-[#9ca3af] font-medium">· Verified Evidence</span>
              </div>
              <p className="text-xs text-[#cbd5e1]">
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
              className="h-8 gap-1.5 text-xs text-[#eff2f6] hover:text-[#ffa116] border-[#383838] bg-[#1e1e1e] hover:bg-[#2e2e2e]"
            >
              <RotateCw className="h-3.5 w-3.5" /> Refresh Evidence
            </Button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {/* Total Skills */}
          <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ffa116]/10 text-[#ffa116]">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#9ca3af] block font-semibold">Total Skills</span>
              <span className="text-sm font-bold text-[#ffffff] font-mono">{summary.total_skills}</span>
            </div>
          </div>

          {/* Mastered */}
          <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00b8a3]/10 text-[#00b8a3]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#9ca3af] block font-semibold">Mastered (≥3 obs)</span>
              <span className="text-sm font-bold text-[#00b8a3] font-mono">
                {summary.mastered_count}
              </span>
            </div>
          </div>

          {/* Proficient */}
          <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#9ca3af] block font-semibold">Proficient</span>
              <span className="text-sm font-bold text-sky-400 font-mono">
                {summary.proficient_count}
              </span>
            </div>
          </div>

          {/* Developing */}
          <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ffa116]/10 text-[#ffa116]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#9ca3af] block font-semibold">Developing</span>
              <span className="text-sm font-bold text-[#ffa116] font-mono">
                {summary.developing_count}
              </span>
            </div>
          </div>

          {/* Unassessed */}
          <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#262626] text-[#9ca3af]">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#9ca3af] block font-semibold">Unassessed</span>
              <span className="text-sm font-bold text-[#9ca3af] font-mono">
                {summary.unassessed_count}
              </span>
            </div>
          </div>

          {/* Overall Proficiency */}
          <div className="p-3 rounded-2xl bg-[#1e1e1e] border border-[#383838] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#ffa116]/10 text-[#ffa116]">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#9ca3af] block font-semibold">Avg Proficiency</span>
              <span className="text-sm font-bold text-[#ffa116] font-mono">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mr-1">
              Domain:
            </span>
            <button
              onClick={() => setDomainFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                domainFilter === 'all'
                  ? 'bg-[#ffa116] text-black shadow-xs font-bold'
                  : 'bg-[#1e1e1e] text-[#cbd5e1] hover:text-[#ffffff] hover:bg-[#2e2e2e] border border-[#383838]'
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
                    ? 'bg-[#ffa116] text-black shadow-xs font-bold'
                    : 'bg-[#1e1e1e] text-[#cbd5e1] hover:text-[#ffffff] hover:bg-[#2e2e2e] border border-[#383838]'
                }`}
              >
                {d.label} ({d.count})
              </button>
            ))}
          </div>

          {/* Mastery Status Pills & Search */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Status filters */}
            <div className="flex items-center gap-1 bg-[#1e1e1e] p-0.5 rounded-lg border border-[#383838]">
              {(['all', 'mastered', 'proficient', 'developing', 'unassessed'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMasteryFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] capitalize font-medium transition-all ${
                    masteryFilter === lvl
                      ? 'bg-[#ffa116] text-black shadow-xs font-bold'
                      : 'text-[#cbd5e1] hover:text-[#ffffff]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-48">
              <Search className="h-3.5 w-3.5 text-[#9ca3af] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Find skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-[#1e1e1e] border border-[#383838] text-[#ffffff] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#ffa116] font-medium"
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
