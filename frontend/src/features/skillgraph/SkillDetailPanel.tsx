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
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkillDetailPanelProps {
  skillSlug: string;
  onClose: () => void;
  onSelectSkill: (slug: string) => void;
}

function formatSkillPercent(val: number | null | undefined): string {
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
      <div className="w-full sm:w-96 md:w-[410px] border-l border-[#383838] bg-[#262626] p-6 flex flex-col items-center justify-center space-y-3 shrink-0 shadow-2xl text-white">
        <div className="h-8 w-8 rounded-full border-2 border-[#ffa116] border-t-transparent animate-spin" />
        <span className="text-xs text-neutral-400 animate-pulse font-medium">Loading skill intelligence...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="w-full sm:w-96 md:w-[410px] border-l border-[#383838] bg-[#262626] p-6 space-y-3 shrink-0 shadow-2xl text-white">
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-400 font-medium">Skill not found</span>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
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
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00b8a3]/20 text-[#00b8a3] border border-[#00b8a3]/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#00b8a3]" />
            Mastered
          </span>
        );
      case 'proficient':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            Proficient
          </span>
        );
      case 'developing':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffc01e]/20 text-[#ffc01e] border border-[#ffc01e]/40">
            <AlertTriangle className="h-3.5 w-3.5 text-[#ffc01e]" />
            Developing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-neutral-400 border border-[#383838]">
            <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
            Unassessed
          </span>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-3.5 w-3.5 text-[#00b8a3]" />;
      case 'declining':
        return <TrendingDown className="h-3.5 w-3.5 text-[#ff375f]" />;
      case 'steady':
        return <Minus className="h-3.5 w-3.5 text-neutral-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full sm:w-96 md:w-[410px] border-l border-[#383838] bg-[#262626] text-[#eff2f6] flex flex-col h-full overflow-hidden shrink-0 z-20 shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#383838] bg-[#1e1e1e] flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40 font-bold">
              Tier {node.tier} · {node.category || node.domain}
            </span>
            {!node.is_unlocked && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#ff375f] bg-[#ff375f]/20 px-1.5 py-0.5 rounded border border-[#ff375f]/40">
                <Lock className="h-2.5 w-2.5" /> Locked
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-white leading-tight">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-[#333333] transition-colors"
          title="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* Description */}
        <p className="text-neutral-300 leading-relaxed font-sans">{node.description}</p>

        {/* Proficiency & Evidence Metrics Card */}
        <div className="p-3.5 rounded-xl border border-[#383838] bg-[#1e1e1e] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Proficiency Status
            </span>
            {getMasteryBadge(node.mastery_level)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-[#141414] border border-[#333333] space-y-0.5">
              <span className="text-[10px] text-neutral-400 block font-medium">Estimated Proficiency</span>
              <span className="text-base font-bold font-mono text-white">
                {formatSkillPercent(node.proficiency)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#141414] border border-[#333333] space-y-0.5">
              <span className="text-[10px] text-neutral-400 block font-medium">Verified Observations</span>
              <span className="text-base font-bold font-mono text-[#ffa116]">
                {node.evidence_count} samples
              </span>
            </div>
          </div>

          {/* Confidence and Trend Badges */}
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#333333] text-neutral-400">
            <span className="capitalize">
              Confidence: <strong className="text-white">{node.confidence_level.replace('_', ' ')}</strong>
            </span>
            {node.recent_trend !== 'no_data' && (
              <span className="flex items-center gap-1 capitalize">
                {getTrendIcon(node.recent_trend)}
                <span className="text-white font-medium">{node.recent_trend}</span>
              </span>
            )}
          </div>
          {node.last_assessed_at && (
            <span className="text-[10px] text-neutral-500 block">
              Last assessed: {node.last_assessed_at}
            </span>
          )}
        </div>

        {/* Recommended Activity Card */}
        {detail.recommended_activity && (
          <div className="p-3.5 rounded-xl border border-purple-500/40 bg-gradient-to-br from-[#2a1a38] to-[#1e1e1e] space-y-2.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              Recommended Next Practice
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs">{detail.recommended_activity.title}</h4>
              <p className="text-[11px] text-neutral-300 leading-snug">
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
              <Button size="sm" className="w-full text-xs gap-1.5 h-8 mt-1 font-bold bg-[#ffa116] hover:bg-[#ff9000] text-black shadow-xs">
                Launch Activity <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}

        {/* Prerequisites Section */}
        {detail.prerequisites.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Prerequisite Skills ({detail.prerequisites.length})
            </span>
            <div className="space-y-1.5">
              {detail.prerequisites.map((p) => (
                <div
                  key={p.slug}
                  onClick={() => onSelectSkill(p.slug)}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#1e1e1e] border border-[#383838] hover:border-[#ffa116] hover:bg-[#2e2417] cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2">
                    {p.is_satisfied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00b8a3] shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-[#ffc01e] shrink-0" />
                    )}
                    <span className="text-xs text-white font-medium">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 capitalize">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Unlocks Advanced Skills ({detail.dependents.length})
            </span>
            <div className="space-y-1.5">
              {detail.dependents.map((d) => (
                <div
                  key={d.slug}
                  onClick={() => onSelectSkill(d.slug)}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#1e1e1e] border border-[#383838] hover:border-[#ffa116] hover:bg-[#2e2417] cursor-pointer transition-all"
                >
                  <span className="text-xs text-white font-medium">{d.name}</span>
                  <span className="text-[10px] text-neutral-400 capitalize font-mono">{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verifiable Assessment Evidence */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Verifiable Assessment Evidence ({detail.supporting_evidence.length})
          </span>
          {detail.supporting_evidence.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {detail.supporting_evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#383838] space-y-1 text-[11px]"
                >
                  <div className="flex items-center justify-between text-white font-medium">
                    <span className="truncate pr-2">{ev.challenge_title}</span>
                    <span className="font-mono text-[#00b8a3] font-bold shrink-0">
                      {formatSkillPercent(ev.score)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span className="uppercase font-mono font-semibold text-[#ffa116]">{ev.source_type}</span>
                    <span>{ev.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#1e1e1e] text-neutral-400 text-[11px] text-center border border-[#383838]">
              No verified submissions for this skill yet.
            </div>
          )}
        </div>

        {/* Related Challenges */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
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
                className="flex items-center justify-between p-2 rounded-lg bg-[#1e1e1e] border border-[#383838] hover:border-[#ffa116] hover:bg-[#2e2417] transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  {ch.challenge_type === 'bughunter' ? (
                    <Bug className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  ) : ch.challenge_type === 'devsim' ? (
                    <Layers className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  ) : (
                    <FileCode2 className="h-3.5 w-3.5 text-[#ffa116] shrink-0" />
                  )}
                  <span className="text-xs text-white truncate group-hover:text-[#ffa116] font-medium">
                    {ch.title}
                  </span>
                </div>
                <span className="text-[10px] capitalize text-neutral-400 font-mono">
                  {ch.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
