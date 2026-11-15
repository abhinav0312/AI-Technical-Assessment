import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';

interface SkillNode {
  id: string;
  slug: string;
  name: string;
  domain: string;
  proficiency: number | null;
  mastery_level: string;
  confidence_level: string;
  evidence_count: number;
}

interface SkillGraphData {
  summary: {
    total_skills: number;
    mastered_count: number;
    proficient_count: number;
    developing_count: number;
    unassessed_count: number;
    overall_proficiency: number;
  };
  nodes: SkillNode[];
  domains: { key: string; label: string; count: number }[];
}

interface DashboardMetrics {
  assessments_completed: number;
  challenges_solved: number;
}

export function AnalyticsPage() {
  const { user } = useAuth();
  const [graphData, setGraphData] = useState<SkillGraphData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [graphRes, metricsRes] = await Promise.allSettled([
          apiClient<SkillGraphData>('/skillgraph/graph'),
          apiClient<DashboardMetrics>('/dashboard/metrics'),
        ]);

        if (graphRes.status === 'fulfilled') {
          setGraphData(graphRes.value);
        }
        if (metricsRes.status === 'fulfilled') {
          setMetrics(metricsRes.value);
        }
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const summary = graphData?.summary || {
    total_skills: 0,
    mastered_count: 0,
    proficient_count: 0,
    developing_count: 0,
    unassessed_count: 0,
    overall_proficiency: 0,
  };

  const assessedNodes = graphData?.nodes.filter((n) => n.mastery_level !== 'unassessed') || [];
  const displayNodes = assessedNodes.length > 0 ? assessedNodes : (graphData?.nodes || []).slice(0, 6);

  const overallPercent = Math.round((summary.overall_proficiency || 0) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#eff2f6]">
      <div className="pb-4 border-b border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ffffff] flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#ffa116]" />
            SkillGraph Analytics & Cognition
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Empirical cognitive vector breakdown computed from real test telemetry and sandbox execution.
          </p>
        </div>

        <Link to="/challenges">
          <Button size="sm" className="gap-1.5 shadow-xs bg-[#ffa116] hover:bg-[#f59e0b] text-black font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Solve Quests
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-[#383838] bg-[#262626] p-5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-xl">
            <div className="text-xs text-[#9ca3af] font-medium">Composite Engineering Index</div>
            <div className="text-3xl font-extrabold text-[#ffffff] mt-1">
              {overallPercent > 0 ? `${overallPercent}%` : 'Calibrating'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>{metrics?.challenges_solved ? `${metrics.challenges_solved} quests solved` : 'Awaiting initial submissions'}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-xl">
            <div className="text-xs text-[#9ca3af] font-medium">Skill Mastery Distribution</div>
            <div className="text-3xl font-extrabold text-[#ffffff] mt-1">
              {summary.mastered_count + summary.proficient_count}
              <span className="text-sm font-normal text-[#9ca3af] ml-1">/ {summary.total_skills} Skills</span>
            </div>
            <div className="text-[11px] text-[#9ca3af] mt-1">
              <span className="text-emerald-400 font-semibold">{summary.mastered_count} Mastered</span> • <span className="text-[#ffa116] font-semibold">{summary.proficient_count} Proficient</span> • <span className="text-sky-400 font-semibold">{summary.developing_count} Developing</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-xl">
            <div className="text-xs text-[#9ca3af] font-medium">Assessments Verified</div>
            <div className="text-3xl font-extrabold text-[#ffffff] mt-1">
              {metrics?.assessments_completed || 0}
            </div>
            <div className="text-[11px] text-[#ffa116] mt-1 font-medium">
              Verified through isolated judge sandboxes
            </div>
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl border border-[#383838] bg-[#262626] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#ffffff]">Competency & Skill Vector Breakdown</h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Live proficiency calculated from test coverage, error recovery, and reasoning depth.
            </p>
          </div>
          <Link to="/skillgraph" className="text-xs font-semibold text-[#ffa116] hover:text-[#ffb84d] flex items-center gap-1">
            Full Interactive Graph
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {displayNodes.map((node) => {
            const score = Math.round((node.proficiency || 0.45) * 100);
            return (
              <div key={node.id} className="p-4 rounded-xl border border-[#383838] bg-[#1e1e1e] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#ffffff]">{node.name}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-[#383838] bg-[#262626] text-[#9ca3af] font-mono">
                      {node.domain}
                    </span>
                  </div>
                  <span className="font-mono text-[#ffa116] font-bold">{score}%</span>
                </div>
                <div className="h-2 w-full bg-[#141414] rounded-full overflow-hidden border border-[#333333]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-[#00b8a3]' : score >= 60 ? 'bg-[#ffa116]' : 'bg-amber-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#9ca3af] flex justify-between">
                  <span className="capitalize">Status: <strong className="text-[#ffffff] capitalize">{node.mastery_level}</strong></span>
                  <span>{node.evidence_count} evidence traces evaluated</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
