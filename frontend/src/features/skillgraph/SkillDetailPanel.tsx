import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { SkillDetailResponse } from '@/types/skillgraph';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCode2,
  Bug,
  Layers,
  History,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkillDetailPanelProps {
  skillSlug: string;
  onClose: () => void;
  onSelectSkill: (slug: string) => void;
}

export function formatSkillPercent(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'N/A';
  // Handles both 0..1 decimal ratio and 0..100 percentage values safely
  const pct = val <= 1.0 && val > 0 ? val * 100 : val;
  return `${Math.round(Math.min(100, Math.max(0, pct)))}%`;
}

export function SkillDetailPanel({
  skillSlug,
  onClose,
  onSelectSkill,
}: SkillDetailPanelProps) {
  const [detail, setDetail] = useState<SkillDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      try {
        const data = await apiClient<SkillDetailResponse>(`/skillgraph/skills/${skillSlug}`);
        setDetail(data);
      } catch (err) {
        console.error('Failed to load skill details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [skillSlug]);

  if (isLoading) {
    return (
      <div className="w-full sm:w-96 md:w-[410px] border-l border-slate-200 bg-white p-6 flex flex-col items-center justify-center space-y-3 shrink-0 shadow-xl">
        <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 animate-pulse font-medium">Loading skill intelligence...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="w-full sm:w-96 md:w-[410px] border-l border-slate-200 bg-white p-6 space-y-3 shrink-0 shadow-xl">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Skill not found</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const { node } = detail;

  const getMasteryBadge = (level: string) => {
    switch (level) {
      case 'mastered':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Mastered
          </span>
        );
      case 'proficient':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            Proficient
          </span>
        );
      case 'developing':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Developing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
            Unassessed
          </span>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
      case 'declining':
        return <TrendingDown className="h-3.5 w-3.5 text-rose-600" />;
      case 'steady':
        return <Minus className="h-3.5 w-3.5 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full sm:w-96 md:w-[410px] border-l border-slate-200 bg-white text-slate-900 flex flex-col h-full overflow-hidden shrink-0 z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
              Tier {node.tier} · {node.category || node.domain}
            </span>
            {!node.is_unlocked && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                <Lock className="h-2.5 w-2.5" /> Locked
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/70 transition-colors"
          title="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* Description */}
        <p className="text-slate-600 leading-relaxed font-sans">{node.description}</p>

        {/* Proficiency & Evidence Metrics Card */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Proficiency Status
            </span>
            {getMasteryBadge(node.mastery_level)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-500 block font-medium">Estimated Proficiency</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {formatSkillPercent(node.proficiency)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-500 block font-medium">Verified Observations</span>
              <span className="text-base font-bold font-mono text-brand-700">
                {node.evidence_count} samples
              </span>
            </div>
          </div>

          {/* Confidence and Trend Badges */}
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 text-slate-500">
            <span className="capitalize">
              Confidence: <strong className="text-slate-800">{node.confidence_level.replace('_', ' ')}</strong>
            </span>
            {node.recent_trend !== 'no_data' && (
              <span className="flex items-center gap-1 capitalize">
                {getTrendIcon(node.recent_trend)}
                <span className="text-slate-800 font-medium">{node.recent_trend}</span>
              </span>
            )}
          </div>
          {node.last_assessed_at && (
            <span className="text-[10px] text-slate-400 block">
              Last assessed: {node.last_assessed_at}
            </span>
          )}
        </div>

        {/* Recommended Activity Card */}
        {detail.recommended_activity && (
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Recommended Next Practice
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-xs">{detail.recommended_activity.title}</h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                {detail.recommended_activity.reason}
              </p>
            </div>
            <Link
              to={
                detail.recommended_activity.activity_type === 'bughunter'
                  ? `/dashboard/bughunter/${detail.recommended_activity.activity_id}`
                  : detail.recommended_activity.activity_type === 'devsim'
                    ? `/dashboard/devsim/${detail.recommended_activity.activity_id}`
                    : `/challenges/${detail.recommended_activity.activity_id}`
              }
            >
              <Button size="sm" className="w-full text-xs gap-1.5 h-8 mt-1 font-semibold shadow-xs">
                Launch Activity <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Prerequisites Section */}
        {detail.prerequisites.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Prerequisite Skills ({detail.prerequisites.length})
            </span>
            <div className="space-y-1.5">
              {detail.prerequisites.map((p) => (
                <div
                  key={p.slug}
                  onClick={() => onSelectSkill(p.slug)}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    {p.is_satisfied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-xs text-slate-800 font-medium">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 capitalize">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependents Unlocked Section */}
        {detail.dependents.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Unlocks Advanced Skills ({detail.dependents.length})
            </span>
            <div className="space-y-1.5">
              {detail.dependents.map((d) => (
                <div
                  key={d.slug}
                  onClick={() => onSelectSkill(d.slug)}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 cursor-pointer transition-all"
                >
                  <span className="text-xs text-slate-800 font-medium">{d.name}</span>
                  <span className="text-[10px] text-slate-500 capitalize font-mono">{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verifiable Assessment Evidence */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Verifiable Assessment Evidence ({detail.supporting_evidence.length})
          </span>
          {detail.supporting_evidence.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {detail.supporting_evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 text-[11px]"
                >
                  <div className="flex items-center justify-between text-slate-900 font-medium">
                    <span className="truncate pr-2">{ev.challenge_title}</span>
                    <span className="font-mono text-emerald-700 font-bold shrink-0">
                      {formatSkillPercent(ev.score)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="uppercase font-mono font-semibold">{ev.source_type}</span>
                    <span>{ev.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-50 text-slate-500 text-[11px] text-center border border-slate-200">
              No verified submissions for this skill yet.
            </div>
          )}
        </div>

        {/* Related Challenges */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Targeted Practice Challenges ({detail.related_challenges.length})
          </span>
          <div className="space-y-1.5">
            {detail.related_challenges.map((ch) => (
              <Link
                key={ch.id}
                to={
                  ch.challenge_type === 'bughunter'
                    ? `/dashboard/bughunter/${ch.slug}`
                    : ch.challenge_type === 'devsim'
                      ? `/dashboard/devsim/${ch.slug}`
                      : `/challenges/${ch.slug}`
                }
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-500 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  {ch.challenge_type === 'bughunter' ? (
                    <Bug className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  ) : ch.challenge_type === 'devsim' ? (
                    <Layers className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  ) : (
                    <FileCode2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  )}
                  <span className="text-xs text-slate-800 truncate group-hover:text-brand-600 font-medium">
                    {ch.title}
                  </span>
                </div>
                <span className="text-[10px] capitalize text-slate-500 font-mono">
                  {ch.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Detected Mistakes & Error Patterns */}
        {detail.recent_mistakes.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Recent Detected Error Patterns
            </span>
            <div className="space-y-1.5">
              {detail.recent_mistakes.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] space-y-1"
                >
                  <span className="font-bold text-amber-900 block">{m.title}</span>
                  <p className="text-amber-800 leading-snug">{m.remediation_advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress History Timeline */}
        {detail.progress_history.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <History className="h-3.5 w-3.5 text-brand-600" />
              Score History
            </span>
            <div className="space-y-1">
              {detail.progress_history.map((h, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-slate-200 text-[11px]"
                >
                  <span className="text-slate-800 font-medium truncate pr-2">{h.challenge}</span>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-bold text-emerald-700">{formatSkillPercent(h.score)}</span>
                    <span className="text-[10px] text-slate-400">{h.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
