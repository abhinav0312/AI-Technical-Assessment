import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import {
  CodeTwinDashboard as ICodeTwinDashboard,
  ErrorPattern,
  LearningPlan,
} from '@/types/codetwin';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldAlert,
  Compass,
  FileCode2,
  Bug,
  Cpu,
  Layers,
  History,
  Info,
  Clock,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CodeTwinDashboard() {
  const [dashboard, setDashboard] = useState<ICodeTwinDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorPattern | null>(null);
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [activePlan, setActivePlan] = useState<LearningPlan | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<ICodeTwinDashboard>('/codetwin/dashboard');
      setDashboard(data);
      if (data.active_learning_plan) {
        setActivePlan(data.active_learning_plan);
      }
    } catch (err) {
      console.error('Failed to fetch CodeTwin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTogglePlanItem = async (itemId: string, currentStatus: boolean) => {
    setIsUpdatingPlan(true);
    try {
      await apiClient<any>(`/codetwin/learning-plan/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
      if (activePlan) {
        setActivePlan({
          ...activePlan,
          items: activePlan.items.map((it) =>
            it.id === itemId ? { ...it, is_completed: !currentStatus } : it
          ),
        });
      }
    } catch (err) {
      console.error('Failed to update plan item:', err);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleRecommendationAction = async (recId: string, action: 'accept' | 'dismiss') => {
    try {
      await apiClient(`/codetwin/recommendations/${recId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (dashboard) {
        setDashboard({
          ...dashboard,
          recommended_activities: dashboard.recommended_activities.filter((r) => r.id !== recId),
        });
      }
    } catch (err) {
      console.error('Failed to action recommendation:', err);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'algorithms':
        return <Cpu className="h-4 w-4 text-sky-400" />;
      case 'data structures':
        return <Layers className="h-4 w-4 text-purple-400" />;
      case 'debugging':
        return <Bug className="h-4 w-4 text-rose-400" />;
      case 'testing':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'sql and databases':
        return <FileCode2 className="h-4 w-4 text-amber-400" />;
      default:
        return <BrainCircuit className="h-4 w-4 text-brand-400" />;
    }
  };

  const filteredSkills = dashboard?.all_proficiencies.filter((s) =>
    filterDomain === 'all' ? true : s.domain.toLowerCase() === filterDomain.toLowerCase()
  ) || [];

  const domains = Array.from(
    new Set(dashboard?.all_proficiencies.map((s) => s.domain) || [])
  );

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Synthesizing traceable skill intelligence from candidate submissions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <BrainCircuit className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-400">
              Technical Skill Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            CodeTwin Profile
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-dark border border-border text-muted-foreground font-mono font-normal">
              Bayesian Evidence Model
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Distinguishes observed performance from estimated proficiency. Weaknesses are strictly derived from verified submission artifacts and evaluation rubrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="gap-1.5 text-xs text-muted-foreground hover:text-white"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh Evidence
          </Button>
          <Link to="/challenges">
            <Button size="sm" className="gap-1.5 text-xs shadow-md shadow-brand-500/20">
              <Compass className="h-3.5 w-3.5" />
              Practice Arena
            </Button>
          </Link>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 flex items-start gap-3 text-xs text-indigo-300">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Private Candidate Skill Record</p>
          <p className="text-indigo-300/80 leading-relaxed text-[11px]">
            This profile is strictly private to you and authorized evaluation reviewers. In accordance with platform privacy rules, individual skill records are never exposed publicly.
          </p>
        </div>
      </div>

      {/* Onboarding State if Insufficient Data */}
      {dashboard?.is_onboarding && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              Initial Calibration Phase
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              CodeTwin explicitly represents <strong className="text-amber-300">insufficient evidence</strong> rather than assigning arbitrary default skill scores. Complete your first 2-3 challenges or debugging tasks to initialize your high-confidence proficiency vector.
            </p>
          </div>
          <Link to="/challenges">
            <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold text-xs whitespace-nowrap">
              Start Calibration Challenge
            </Button>
          </Link>
        </div>
      )}

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strongest Skills */}
        <div className="rounded-xl border border-border/70 bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Strongest Verified Skills
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              High Confidence
            </span>
          </div>
          <div className="space-y-2">
            {dashboard?.strongest_skills.length ? (
              dashboard.strongest_skills.slice(0, 3).map((skill) => (
                <div key={skill.skill_id} className="p-2.5 rounded-lg bg-surface-darkest border border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{skill.skill_name}</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {Math.round(skill.estimated_proficiency * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-dark h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(skill.estimated_proficiency * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Domain: {skill.domain}</span>
                    <span>{skill.evidence_count} evidence items</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground p-3 bg-surface-darkest rounded-lg">
                No high-confidence skills yet. Solve challenges to build your verified vector.
              </div>
            )}
          </div>
        </div>

        {/* Skills Needing Evidence */}
        <div className="rounded-xl border border-border/70 bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-400" />
              Skills Needing Evidence
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              Target Areas
            </span>
          </div>
          <div className="space-y-2">
            {dashboard?.skills_needing_evidence.length ? (
              dashboard.skills_needing_evidence.slice(0, 3).map((skill) => (
                <div key={skill.skill_id} className="p-2.5 rounded-lg bg-surface-darkest border border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{skill.skill_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                      Needs Evidence
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Domain: {skill.domain}</span>
                    <span>Evidence: {skill.evidence_count} items</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground p-3 bg-surface-darkest rounded-lg">
                All taxonomy skills have sufficient active evidence.
              </div>
            )}
          </div>
        </div>

        {/* Detected Error Patterns */}
        <div className="rounded-xl border border-border/70 bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Traceable Error Patterns
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              Root Cause
            </span>
          </div>
          <div className="space-y-2">
            {dashboard?.recurring_error_patterns.length ? (
              dashboard.recurring_error_patterns.slice(0, 3).map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => setSelectedError(pat)}
                  className="p-2.5 rounded-lg bg-surface-darkest border border-border/40 hover:border-amber-500/40 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{pat.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono">
                      {pat.frequency}x seen
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {pat.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground p-3 bg-surface-darkest rounded-lg">
                No recurring error patterns detected across your submissions.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Skills Matrix + Recommendations & Learning Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8-Domain Skill Taxonomy & Proficiency Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border/70 bg-surface-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Skill Taxonomy & Proficiencies
                </h2>
                <p className="text-xs text-muted-foreground">
                  Bayesian estimate calibrated by test-case correctness and evaluation rubrics
                </p>
              </div>

              {/* Domain Filter Pills */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterDomain('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterDomain === 'all'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-surface-dark text-muted-foreground hover:text-white'
                  }`}
                >
                  All
                </button>
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDomain(d)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      filterDomain.toLowerCase() === d.toLowerCase()
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-surface-dark text-muted-foreground hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Items List */}
            <div className="space-y-3 pt-2">
              {filteredSkills.length ? (
                filteredSkills.map((prof) => (
                  <div
                    key={prof.skill_id}
                    className="p-3.5 rounded-xl border border-border/50 bg-surface-darkest space-y-2 hover:border-border transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDomainIcon(prof.domain)}
                        <div>
                          <span className="text-xs font-bold text-white block">{prof.skill_name}</span>
                          <span className="text-[10px] text-muted-foreground">{prof.domain}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {prof.confidence_level === 'insufficient_evidence' ? (
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Insufficient Evidence
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-brand-300">
                              {Math.round(prof.estimated_proficiency * 100)}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              (Observed: {Math.round(prof.observed_performance * 100)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dual Progress Bar: Estimated vs Observed */}
                    {prof.confidence_level !== 'insufficient_evidence' ? (
                      <div className="space-y-1">
                        <div className="w-full bg-surface-dark h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.round(prof.estimated_proficiency * 100)}%` }}
                            title={`Estimated Proficiency: ${Math.round(prof.estimated_proficiency * 100)}%`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>Evidence: {prof.evidence_count} samples</span>
                          <span>Confidence: {prof.confidence_level}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-surface-dark/40 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>No verifiable submissions recorded for this skill yet.</span>
                        <Link to="/challenges" className="text-brand-400 hover:underline flex items-center gap-1 font-semibold">
                          Collect Evidence <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No skills matching current domain filter.
                </div>
              )}
            </div>
          </div>

          {/* Historical Improvement Log */}
          {dashboard?.historical_improvement && dashboard.historical_improvement.length > 0 && (
            <div className="rounded-xl border border-border/70 bg-surface-card p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <History className="h-4 w-4 text-brand-400" />
                Evidence Timeline & Improvement
              </h3>
              <div className="space-y-2">
                {dashboard.historical_improvement.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-darkest border border-border/40 text-xs">
                    <div>
                      <span className="font-semibold text-white">{log.challenge}</span>
                      <span className="text-[11px] text-muted-foreground block">{log.skill} · {log.source}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400">
                        {Math.round(log.score * 100)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground block">{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Personalized Recommendations & Weekly Learning Plan */}
        <div className="lg:col-span-5 space-y-4">
          {/* Explainable Next Activities */}
          <div className="rounded-xl border border-border/70 bg-surface-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="h-4 w-4 text-brand-400" />
                  Recommended Activities
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ranked by prerequisite gaps and recent performance
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {dashboard?.recommended_activities.length ? (
                dashboard.recommended_activities.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-border/50 bg-surface-darkest space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white block">{rec.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase font-mono text-brand-300">
                            {rec.activity_type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] capitalize text-slate-300">
                            {rec.difficulty}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">
                        Rank #{Math.round(rec.rank_score)}
                      </span>
                    </div>

                    {/* Explainability Callout */}
                    <div className="p-2 rounded bg-surface-dark text-[11px] text-indigo-300 flex items-start gap-1.5 border border-indigo-500/20">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-400 mt-0.5" />
                      <span className="leading-snug">{rec.reason}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecommendationAction(rec.id, 'dismiss')}
                        className="h-7 text-[11px] text-muted-foreground hover:text-rose-400"
                      >
                        Dismiss
                      </Button>
                      <Link to={rec.activity_type === 'bughunter' ? `/dashboard/bughunter/${rec.activity_id}` : `/challenges/${rec.activity_id}`}>
                        <Button size="sm" className="h-7 text-[11px] gap-1 shadow-sm">
                          Start Activity <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No pending recommendations. You are fully up to date!
                </div>
              )}
            </div>
          </div>

          {/* Weekly Learning Plan */}
          <div className="rounded-xl border border-border/70 bg-surface-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-400" />
                  Weekly Learning Plan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Structured study plan calibrated to current goals
                </p>
              </div>
              {activePlan && (
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {Math.round(
                    ((activePlan.items.filter((i) => i.is_completed).length || 0) /
                      (activePlan.items.length || 1)) *
                      100
                  )}
                  % Done
                </span>
              )}
            </div>

            {activePlan ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/40">
                  <span>Week starting: {activePlan.week_start_date}</span>
                  <span>Est: {activePlan.estimated_hours}h / week</span>
                </div>

                <div className="space-y-2">
                  {activePlan.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border transition-all flex items-start gap-3 ${
                        item.is_completed
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-surface-darkest border-border/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.is_completed}
                        onChange={() => handleTogglePlanItem(item.id, item.is_completed)}
                        disabled={isUpdatingPlan}
                        className="mt-1 h-4 w-4 rounded border-border bg-surface-dark text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span
                          className={`text-xs font-medium block ${
                            item.is_completed ? 'line-through text-muted-foreground' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="text-brand-300">{item.target_skill}</span>
                          <span>·</span>
                          <span>{item.estimated_minutes} mins</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Honest Guidance Disclaimer */}
                <p className="text-[10px] text-muted-foreground/80 italic leading-snug pt-2">
                  * Notice: DevMind learning plans provide structured practice based on current evidence. Actual interview outcomes depend on comprehensive technical competency and real-time execution.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-surface-darkest border border-border/40 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  No active learning plan for this week.
                </p>
                <Button size="sm" variant="outline" className="text-xs">
                  Generate Weekly Plan
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Pattern Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-surface-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedError.title}</h3>
                  <span className="text-xs text-amber-400 capitalize">
                    {selectedError.severity} Severity · {selectedError.pattern_category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-muted-foreground hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedError.description}
            </p>

            {/* Remediation Advice */}
            <div className="p-3 rounded-lg bg-surface-dark border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Remediation Advice
              </span>
              <p className="text-xs text-slate-200">{selectedError.remediation_advice}</p>
            </div>

            {/* Supporting Evidence Traceability */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                Traceable Supporting Evidence ({selectedError.supporting_evidence.length} occurrences)
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedError.supporting_evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-surface-darkest border border-border/40 text-[11px] space-y-0.5"
                  >
                    <div className="flex justify-between text-muted-foreground">
                      <span className="font-medium text-white">{ev.title}</span>
                      <span className="font-mono text-[10px]">ID: {ev.source_id.slice(0, 8)}</span>
                    </div>
                    <p className="text-rose-300/90 font-mono text-[10px]">{ev.error_summary}</p>
                    <span className="text-[9px] text-muted-foreground block">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedError(null)} className="text-xs">
                Close Trace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CodeTwinDashboard;
