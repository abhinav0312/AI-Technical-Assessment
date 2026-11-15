import { ThinkTraceReport } from '@/types/thinktrace';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Shield,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
} from 'lucide-react';

interface ThinkTraceReportModalProps {
  report: ThinkTraceReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ThinkTraceReportModal({ report, isOpen, onClose }: ThinkTraceReportModalProps) {
  if (!isOpen || !report) return null;

  const rubricScores = [
    { label: 'Problem Understanding', score: report.problem_understanding_score, weight: '20%' },
    { label: 'Algorithm Correctness', score: report.algorithm_correctness_score, weight: '25%' },
    { label: 'Edge Case Awareness', score: report.edge_case_awareness_score, weight: '15%' },
    { label: 'Complexity Analysis', score: report.complexity_analysis_score, weight: '15%' },
    { label: 'Code Consistency', score: report.code_consistency_score, weight: '15%' },
    { label: 'Trade-off Rationale', score: report.tradeoff_explanation_score, weight: '10%' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#262626] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden text-[#eff2f6]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#383838] bg-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs ${
              report.tier === 'flash_lite' || report.ai_model?.includes('lite')
                ? 'bg-[#ffa116] text-black font-extrabold'
                : 'bg-purple-600'
            }`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">ThinkTrace AI Assessment Report</h2>
                {report.tier === 'flash_lite' || report.ai_model?.includes('lite') ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40 flex items-center gap-1">
                    ⚡ Gemini Flash Lite ({report.latency_ms || 18}ms)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    ✨ Gemini Flash Pro (Deep Cognitive)
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Challenge: <span className="text-white font-medium">{report.challenge_title || 'Coding Arena Challenge'}</span> • Provider: {report.ai_provider}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#333333] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Top Level Scores Split (Deterministic vs Reasoning) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deterministic Execution Score */}
            <div className="p-5 rounded-2xl border border-[#383838] bg-[#1e1e1e] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#ffa116]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Deterministic Code Correctness
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    report.code_status === 'accepted'
                      ? 'text-[#00b8a3] bg-[#00b8a3]/20 border-[#00b8a3]/40'
                      : 'text-[#ffc01e] bg-[#ffc01e]/20 border-[#ffc01e]/40'
                  }`}
                >
                  {report.code_status}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-white">{Math.round(report.code_score)}%</span>
                  <span className="text-xs text-neutral-400 ml-2">Execution Score</span>
                </div>
                <div className="text-right text-xs text-neutral-300">
                  <span className="font-medium">{report.passed_tests} / {report.total_tests} Tests Passed</span>
                  {report.execution_time_ms && (
                    <span className="block text-[11px] text-neutral-500 font-mono">{report.execution_time_ms} ms</span>
                  )}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-neutral-400 border-t border-[#383838] pt-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#00b8a3]" />
                <span>Deterministic sandbox execution. AI scores never overwrite underlying test cases.</span>
              </div>
            </div>

            {/* AI Reasoning Rubric Score */}
            <div className="p-5 rounded-2xl border border-[#383838] bg-[#1e1e1e] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Reasoning Rubric Evaluation
                  </span>
                </div>
                <span className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getScoreColor(report.overall_reasoning_score)}`}>
                  {report.confidence_level} confidence ({Math.round(report.confidence_score * 100)}%)
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-white">{Math.round(report.overall_reasoning_score)}</span>
                  <span className="text-xs text-neutral-400 ml-1">/ 100</span>
                  <span className="text-xs text-neutral-400 ml-2">Rubric Score</span>
                </div>
                <span className="text-xs text-purple-300 font-bold">
                  {report.overall_reasoning_score >= 80 ? 'Mastery' : report.overall_reasoning_score >= 60 ? 'Proficient' : 'Developing'}
                </span>
              </div>
              <div className="mt-3 text-[11px] text-neutral-400 border-t border-[#383838] pt-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Evaluates stated reasoning & approach consistency with observable work.</span>
              </div>
            </div>
          </div>

          {/* 6-Dimensional Rubric Breakdown */}
          <div className="p-5 rounded-2xl border border-[#383838] bg-[#1e1e1e] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#ffa116]" />
              Reasoning Rubric Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {rubricScores.map((rubric) => (
                <div key={rubric.label} className="space-y-1.5 p-3 rounded-xl bg-[#141414] border border-[#383838]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-300 font-semibold">{rubric.label}</span>
                    <span className="font-bold text-white">{Math.round(rubric.score)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#2a2a2a] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(rubric.score)}`}
                      style={{ width: `${Math.min(100, Math.max(0, rubric.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Missing Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl border border-[#00b8a3]/40 bg-[#0f241a] space-y-2.5">
              <h4 className="text-xs font-bold text-[#00b8a3] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                Demonstrated Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-200">
                {report.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00b8a3] mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-400 italic">No specific strengths recorded.</li>
                )}
              </ul>
            </div>

            {/* Areas for Growth / Missing Steps */}
            <div className="p-5 rounded-2xl border border-[#ffa116]/40 bg-[#2e2417] space-y-2.5">
              <h4 className="text-xs font-bold text-[#ffa116] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#ffa116]" />
                Missing or Incomplete Steps
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-200">
                {report.missing_or_incorrect_steps && report.missing_or_incorrect_steps.length > 0 ? (
                  report.missing_or_incorrect_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ffa116] mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-400 italic">No missing critical reasoning steps identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Socratic Questions for Independent Reasoning */}
          {report.socratic_guiding_questions && report.socratic_guiding_questions.length > 0 && (
            <div className="p-5 rounded-2xl border border-purple-500/40 bg-[#281b36] space-y-2.5">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-purple-400" />
                Socratic Guided Inquiries (Prompts to Reason Independently)
              </h4>
              <p className="text-xs text-neutral-300">
                ThinkTrace avoids revealing full solutions upfront when a guiding question fosters independent problem-solving:
              </p>
              <div className="space-y-2 pt-1">
                {report.socratic_guiding_questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1c1326] border border-purple-500/40 text-xs text-neutral-200 flex items-start gap-2 shadow-2xs">
                    <span className="font-bold text-purple-400 shrink-0">Q{idx + 1}:</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Approaches & Concept Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alternative Approaches */}
            <div className="p-5 rounded-2xl border border-[#383838] bg-[#1e1e1e] space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-[#ffa116]" />
                Alternative & More Efficient Approaches
              </h4>
              <ul className="space-y-1.5 text-xs text-neutral-300">
                {report.alternative_approaches && report.alternative_approaches.length > 0 ? (
                  report.alternative_approaches.map((alt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ffa116] mt-1.5 shrink-0" />
                      <span>{alt}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Your proposed approach is optimal for these constraints.</li>
                )}
              </ul>
            </div>

            {/* Recommended Concepts */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="h-4 w-4 text-brand-600" />
                Related Concepts & References
              </h4>
              <div className="space-y-1.5">
                {report.recommended_concept_links && report.recommended_concept_links.length > 0 ? (
                  report.recommended_concept_links.map((concept, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-slate-800 font-semibold">{concept.name}</span>
                      <span className="text-[11px] text-brand-600 font-medium">Concept Guide</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No concept links referenced.</p>
                )}
              </div>
            </div>
          </div>

          {/* Audit & Reliability Footer */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              <span>Rubric Version: </span>
              <span className="text-slate-800 font-mono font-medium">{report.rubric_version}</span>
              <span className="mx-2">•</span>
              <span>Prompt Version: </span>
              <span className="text-slate-800 font-mono font-medium">{report.prompt_version}</span>
            </div>
            <div>
              <span>Evaluator: </span>
              <span className="text-slate-800 font-medium">{report.ai_provider} ({report.ai_model})</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
