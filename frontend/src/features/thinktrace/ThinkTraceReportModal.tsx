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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">ThinkTrace AI Assessment Report</h2>
                {report.is_fallback ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Heuristic Evaluator
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {report.ai_model || 'AI Assisted'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Challenge: <span className="text-slate-800 font-medium">{report.challenge_title || 'Coding Arena Challenge'}</span> • Mode: Combined Evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Top Level Scores Split (Deterministic vs Reasoning) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deterministic Execution Score */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Deterministic Code Correctness
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    report.code_status === 'accepted'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}
                >
                  {report.code_status}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900">{Math.round(report.code_score)}%</span>
                  <span className="text-xs text-slate-500 ml-2">Execution Score</span>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <span className="font-medium">{report.passed_tests} / {report.total_tests} Tests Passed</span>
                  {report.execution_time_ms && (
                    <span className="block text-[11px] text-slate-400 font-mono">{report.execution_time_ms} ms</span>
                  )}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-200/80 pt-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Deterministic sandbox execution. AI scores never overwrite underlying test cases.</span>
              </div>
            </div>

            {/* AI Reasoning Rubric Score */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Reasoning Rubric Evaluation
                  </span>
                </div>
                <span className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getScoreColor(report.overall_reasoning_score)}`}>
                  {report.confidence_level} confidence ({Math.round(report.confidence_score * 100)}%)
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900">{Math.round(report.overall_reasoning_score)}</span>
                  <span className="text-xs text-slate-500 ml-1">/ 100</span>
                  <span className="text-xs text-slate-500 ml-2">Rubric Score</span>
                </div>
                <span className="text-xs text-brand-700 font-semibold">
                  {report.overall_reasoning_score >= 80 ? 'Mastery' : report.overall_reasoning_score >= 60 ? 'Proficient' : 'Developing'}
                </span>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-200/80 pt-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Evaluates stated reasoning & approach consistency with observable work.</span>
              </div>
            </div>
          </div>

          {/* 6-Dimensional Rubric Breakdown */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600" />
              Reasoning Rubric Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {rubricScores.map((rubric) => (
                <div key={rubric.label} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-semibold">{rubric.label}</span>
                    <span className="font-bold text-slate-900">{Math.round(rubric.score)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
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
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Demonstrated Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.strengths && report.strengths.length > 0 ? (
                  report.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No specific strengths recorded.</li>
                )}
              </ul>
            </div>

            {/* Areas for Growth / Missing Steps */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Missing or Incomplete Steps
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.missing_or_incorrect_steps && report.missing_or_incorrect_steps.length > 0 ? (
                  report.missing_or_incorrect_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No missing critical reasoning steps identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Socratic Questions for Independent Reasoning */}
          {report.socratic_guiding_questions && report.socratic_guiding_questions.length > 0 && (
            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-2.5">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                Socratic Guided Inquiries (Prompts to Reason Independently)
              </h4>
              <p className="text-xs text-slate-600">
                ThinkTrace avoids revealing full solutions upfront when a guiding question fosters independent problem-solving:
              </p>
              <div className="space-y-2 pt-1">
                {report.socratic_guiding_questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 flex items-start gap-2 shadow-2xs">
                    <span className="font-bold text-indigo-600 shrink-0">Q{idx + 1}:</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Approaches & Concept Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alternative Approaches */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Alternative & More Efficient Approaches
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {report.alternative_approaches && report.alternative_approaches.length > 0 ? (
                  report.alternative_approaches.map((alt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
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
