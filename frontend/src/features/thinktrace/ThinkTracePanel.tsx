import { useState, useEffect } from 'react';
import { ReasoningRecord, ReasoningVersion, ThinkTraceReport } from '@/types/thinktrace';
import { apiClient } from '@/lib/api-client';
import {
  Brain,
  History,
  Save,
  Sparkles,
  AlertCircle,
  Clock,
  HardDrive,
  Info,
  CheckCircle,
} from 'lucide-react';
import { ThinkTraceReportModal } from './ThinkTraceReportModal';

interface ThinkTracePanelProps {
  challengeSlug: string;
  sourceCode: string;
  language: string;
  requiredFields?: string[];
}

export function ThinkTracePanel({
  challengeSlug,
  sourceCode,
  language,
  requiredFields = [],
}: ThinkTracePanelProps) {
  const [record, setRecord] = useState<ReasoningRecord>({
    problem_interpretation: '',
    proposed_algorithm: '',
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    edge_cases: '',
    tradeoff_reasoning: '',
    mode: 'practice',
  });

  const [versions, setVersions] = useState<ReasoningVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Evaluation Report State
  const [activeReport, setActiveReport] = useState<ThinkTraceReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Fetch Existing Reasoning Record & Versions
  useEffect(() => {
    async function loadReasoning() {
      setIsLoading(true);
      try {
        const data = await apiClient<ReasoningRecord | null>(`/thinktrace/challenges/${challengeSlug}/reasoning`);
        if (data) {
          setRecord({
            problem_interpretation: data.problem_interpretation || '',
            proposed_algorithm: data.proposed_algorithm || '',
            time_complexity: data.time_complexity || 'O(N)',
            space_complexity: data.space_complexity || 'O(1)',
            edge_cases: data.edge_cases || '',
            tradeoff_reasoning: data.tradeoff_reasoning || '',
            mode: data.mode || 'practice',
            version: data.version,
            is_locked: data.is_locked,
          });
        }
        // Load versions
        const vers = await apiClient<ReasoningVersion[]>(`/thinktrace/challenges/${challengeSlug}/reasoning/versions`);
        if (vers) {
          setVersions(vers);
        }
      } catch (err) {
        console.error('Failed to load reasoning:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReasoning();
  }, [challengeSlug]);

  const handleSaveReasoning = async (changeSummary?: string) => {
    setIsSaving(true);
    setSaveStatus(null);
    setValidationError(null);
    try {
      const payload = {
        ...record,
        change_summary: changeSummary || 'Candidate revised approach',
      };
      const saved = await apiClient<ReasoningRecord>(`/thinktrace/challenges/${challengeSlug}/reasoning`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setRecord(saved);
      setSaveStatus(`Saved as Version ${saved.version}`);

      // Refresh versions list
      const vers = await apiClient<ReasoningVersion[]>(`/thinktrace/challenges/${challengeSlug}/reasoning/versions`);
      setVersions(vers);
    } catch (err: any) {
      console.error('Failed to save reasoning:', err);
      setValidationError(err.message || 'Failed to save reasoning record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectVersion = (versionNumber: number) => {
    setSelectedVersion(versionNumber);
    const target = versions.find((v) => v.version_number === versionNumber);
    if (target) {
      setRecord((prev) => ({
        ...prev,
        problem_interpretation: target.problem_interpretation,
        proposed_algorithm: target.proposed_algorithm,
        time_complexity: target.time_complexity,
        space_complexity: target.space_complexity,
        edge_cases: target.edge_cases,
        tradeoff_reasoning: target.tradeoff_reasoning,
        version: target.version_number,
      }));
    }
  };

  const handleCombinedEvaluation = async () => {
    setValidationError(null);

    // Validation check for assessment mode
    if (record.mode === 'assessment' && requiredFields.length > 0) {
      const missing = requiredFields.filter((f) => !(record as any)[f]?.trim());
      if (missing.length > 0) {
        setValidationError(`Assessment creator requires: ${missing.join(', ')}.`);
        return;
      }
    }

    setIsEvaluating(true);
    try {
      const payload = {
        reasoning: record,
        source_code: sourceCode,
        language: language,
      };
      const report = await apiClient<ThinkTraceReport>(`/thinktrace/challenges/${challengeSlug}/evaluate-reasoning`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setActiveReport(report);
      setIsReportOpen(true);
    } catch (err: any) {
      console.error('Combined evaluation failed:', err);
      setValidationError(err.message || 'Failed to run combined evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const timeComplexityOptions = ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)', 'O(2^N)', 'O(N!)'];
  const spaceComplexityOptions = ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
        <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground">Loading reasoning workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto p-4 space-y-4 text-xs text-slate-800">
      {/* Top Header & Mode Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              ThinkTrace AI Reasoning
              {record.version && (
                <span className="text-[10px] text-slate-500 font-medium">v{record.version}</span>
              )}
            </h3>
            <span className="text-[10px] text-slate-500">Capture stated approach before coding</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setRecord((prev) => ({ ...prev, mode: 'practice' }))}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              record.mode === 'practice' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setRecord((prev) => ({ ...prev, mode: 'assessment' }))}
            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              record.mode === 'assessment' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assessment
          </button>
        </div>
      </div>

      {/* Transparency Banner */}
      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-2.5 text-[11px] text-indigo-900 leading-relaxed">
        <Info className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
        <span>
          Your stated reasoning is preserved as an assessment artifact. Observable work is evaluated against a 6-factor rubric and combined with deterministic test results.
        </span>
      </div>

      {/* Version History Selector */}
      {versions.length > 1 && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <History className="h-3.5 w-3.5" />
            <span>Version History ({versions.length} saves)</span>
          </div>
          <div className="flex items-center gap-1">
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVersion(v.version_number)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  (selectedVersion ?? record.version) === v.version_number
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
                title={v.change_summary || `Version ${v.version_number}`}
              >
                v{v.version_number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Validation / Error Feedback */}
      {validationError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 1. Problem Interpretation */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
          <span>1. Problem Interpretation</span>
          {record.mode === 'assessment' && <span className="text-[10px] text-brand-600">*Required</span>}
        </label>
        <textarea
          value={record.problem_interpretation}
          onChange={(e) => setRecord({ ...record, problem_interpretation: e.target.value })}
          placeholder="State your understanding of the constraints, requirements, and goal in your own words..."
          className="w-full h-18 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans resize-none transition-colors"
        />
      </div>

      {/* 2. Proposed Algorithm */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
          <span>2. Proposed Algorithm & Step-by-Step Logic</span>
          {record.mode === 'assessment' && <span className="text-[10px] text-brand-600">*Required</span>}
        </label>
        <textarea
          value={record.proposed_algorithm}
          onChange={(e) => setRecord({ ...record, proposed_algorithm: e.target.value })}
          placeholder="Outline your algorithmic approach (e.g. hash map lookups, monotonic queue, two-pointer pass)..."
          className="w-full h-20 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans resize-none transition-colors"
        />
      </div>

      {/* 3 & 4. Complexities */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500" />
            Expected Time
          </label>
          <select
            value={record.time_complexity}
            onChange={(e) => setRecord({ ...record, time_complexity: e.target.value })}
            className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
          >
            {timeComplexityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <HardDrive className="h-3 w-3 text-indigo-500" />
            Expected Space
          </label>
          <select
            value={record.space_complexity}
            onChange={(e) => setRecord({ ...record, space_complexity: e.target.value })}
            className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 font-medium"
          >
            {spaceComplexityOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Edge Cases */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
          <span>5. Critical Edge Cases to Guard Against</span>
          <span className="text-[10px] text-slate-400">Empty inputs, single item, collisions</span>
        </label>
        <textarea
          value={record.edge_cases}
          onChange={(e) => setRecord({ ...record, edge_cases: e.target.value })}
          placeholder="e.g. Empty input, single-element collection, negative integers, boundary collisions..."
          className="w-full h-16 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans resize-none transition-colors"
        />
      </div>

      {/* 6. Trade-off Reasoning */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-800">
          <span>6. Trade-off Rationale (Why this approach?)</span>
        </label>
        <textarea
          value={record.tradeoff_reasoning}
          onChange={(e) => setRecord({ ...record, tradeoff_reasoning: e.target.value })}
          placeholder="Explain why you chose this design over potential alternatives (e.g. memory vs speed trade-offs)..."
          className="w-full h-16 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans resize-none transition-colors"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveReasoning()}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold transition-colors"
          >
            <Save className="h-3.5 w-3.5 text-brand-600" />
            {isSaving ? 'Saving...' : 'Save Draft Snapshot'}
          </button>

          {activeReport && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold transition-colors"
            >
              View Last Report
            </button>
          )}
        </div>

        <button
          onClick={handleCombinedEvaluation}
          disabled={isEvaluating}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-xs transition-all"
        >
          <Sparkles className="h-4 w-4" />
          {isEvaluating ? 'Evaluating Code & Reasoning...' : 'Run Combined Evaluation'}
        </button>

        {saveStatus && (
          <p className="text-[11px] text-emerald-600 text-center flex items-center justify-center gap-1 font-medium">
            <CheckCircle className="h-3 w-3" />
            {saveStatus}
          </p>
        )}
      </div>

      {/* Assessment Report Modal */}
      <ThinkTraceReportModal
        report={activeReport}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
