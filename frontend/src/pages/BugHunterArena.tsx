import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { apiClient } from '@/lib/api-client';
import {
  BugHunterChallenge,
  BugHunterRunResult,
  BugHunterSubmissionResult,
} from '@/types/bughunter';
import {
  Bug,
  Play,
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Flame,
  ArrowLeft,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BugHunterArena() {
  const { slug } = useParams<{ slug: string }>();
  const [challenge, setChallenge] = useState<BugHunterChallenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [suspectedRootCause, setSuspectedRootCause] = useState<string>('');
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<BugHunterRunResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<BugHunterSubmissionResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'hypothesis' | 'hints'>('report');

  const fetchChallenge = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const data = await apiClient<BugHunterChallenge>(`/bughunter/challenges/${slug}`);
      setChallenge(data);
      setCode(data.starter_code);
    } catch (err) {
      console.error('Failed to load debugging challenge:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleResetCode = () => {
    if (challenge) {
      setCode(challenge.starter_code);
    }
  };

  const handleUnlockHint = (level: number) => {
    if (!unlockedHints.includes(level)) {
      setUnlockedHints([...unlockedHints, level]);
    }
  };

  const handleRunReproduction = async () => {
    if (!slug || isExecuting) return;
    setIsExecuting(true);
    setRunResult(null);
    try {
      const res = await apiClient<BugHunterRunResult>(`/bughunter/challenges/${slug}/run-repro`, {
        method: 'POST',
        body: JSON.stringify({ source_code: code }),
      });
      setRunResult(res);
    } catch (err: any) {
      setRunResult({
        passed_tests: 0,
        total_tests: 0,
        execution_time_ms: 0,
        all_passed: false,
        test_results: [
          {
            test_index: 0,
            description: 'Execution failed',
            passed: false,
            is_public: true,
            actual_output: '',
            expected_output: '',
            stderr: err.message || 'Execution error in sandbox runner',
            execution_time_ms: 0,
          },
        ],
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitFix = async () => {
    if (!slug || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient<BugHunterSubmissionResult>(`/bughunter/challenges/${slug}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          source_code: code,
          suspected_root_cause_id: suspectedRootCause || undefined,
        }),
      });
      setSubmissionResult(res);
      setIsReportOpen(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Loading diagnostic sandbox and bug report...
        </p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-base font-bold text-white">Debugging challenge not found</h2>
        <Link to="/dashboard/bughunter">
          <Button variant="outline" size="sm">
            Back to BugHunter
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-3 overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl border border-[#383838] bg-[#262626] shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/bughunter"
            className="flex items-center gap-1 text-xs text-[#9ca3af] hover:text-[#ffffff] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">BugHunter</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#383838]" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/30">
              <Bug className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold text-[#ffffff]">{challenge.title}</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#cbd5e1]">
              {challenge.bug_category.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Run Repro Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunReproduction}
            disabled={isExecuting || isSubmitting}
            className="h-8 gap-1.5 text-xs border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:bg-[#2e2e2e] font-semibold"
          >
            <Play className={`h-3 w-3 ${isExecuting ? 'animate-spin' : ''}`} />
            Run Repro Tests
          </Button>

          {/* Submit Fix Button */}
          <Button
            size="sm"
            onClick={handleSubmitFix}
            disabled={isExecuting || isSubmitting}
            className="h-8 gap-1.5 text-xs bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold shadow-xs"
          >
            <Send className="h-3 w-3" />
            Submit Fix
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Left Info & Diagnosis, Right Monaco Editor & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Bug Report, Root Cause Hypothesis, Hints */}
        <div className="lg:col-span-5 rounded-2xl border border-[#383838] bg-[#262626] flex flex-col overflow-hidden min-h-0 shadow-sm">
          {/* Sub tabs */}
          <div className="p-2 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'report'
                    ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs'
                    : 'text-[#9ca3af] hover:text-[#ffffff]'
                }`}
              >
                <Bug className="h-3.5 w-3.5 text-[#ff375f]" />
                Bug Report
              </button>
              <button
                onClick={() => setActiveTab('hypothesis')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'hypothesis'
                    ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs'
                    : 'text-[#9ca3af] hover:text-[#ffffff]'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5 text-[#ffa116]" />
                Root Cause
                {suspectedRootCause && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffa116]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'hints'
                    ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs'
                    : 'text-[#9ca3af] hover:text-[#ffffff]'
                }`}
              >
                <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                Hints ({unlockedHints.length}/{challenge.hints.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Bug Report */}
          {activeTab === 'report' && (
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#cbd5e1] flex-1">
              {/* Problem Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Problem Description
                </span>
                <p className="text-[#cbd5e1] leading-relaxed font-sans">{challenge.description}</p>
              </div>

              {/* Bug Report & Stack Trace */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff375f]">
                  Incident Reproduction & Observed Failure
                </span>
                <div className="p-3.5 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/30 font-mono text-[11px] text-[#ff375f] whitespace-pre-wrap leading-relaxed">
                  {challenge.bug_report}
                </div>
              </div>

              {/* Expected Behavior */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00b8a3]">
                  Expected Invariant & Behavior
                </span>
                <p className="text-[#cbd5e1] leading-relaxed">{challenge.expected_behavior}</p>
              </div>

              {/* Public Examples */}
              <div className="space-y-2 pt-3 border-t border-[#383838]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                  Public Reproduction Test Cases
                </span>
                {challenge.public_test_cases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838] space-y-1">
                    <span className="text-[11px] font-bold text-[#ffffff] block">{tc.description}</span>
                    <div className="text-[11px] font-mono text-[#cbd5e1]">
                      Input: <span className="text-[#ffffff]">{tc.stdin}</span>
                    </div>
                    <div className="text-[11px] font-mono text-[#cbd5e1]">
                      Expected Output: <span className="text-[#00b8a3] font-bold">{tc.expected_output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Suspected Root Cause Hypothesis */}
          {activeTab === 'hypothesis' && (
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#cbd5e1] flex-1">
              <div className="p-3.5 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116] space-y-1">
                <span className="font-bold block text-[#ffffff]">Formulate Root Cause Hypothesis</span>
                <p className="text-[11px] leading-relaxed text-[#cbd5e1]">
                  Demonstrate architectural diagnostic skill by selecting what you suspect causes this failure before running or submitting your fix.
                </p>
              </div>

              <div className="space-y-2">
                {challenge.root_cause_options.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setSuspectedRootCause(opt.id)}
                    className={`flex items-start gap-2.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      suspectedRootCause === opt.id
                        ? 'bg-[#ffa116]/10 border-[#ffa116] text-[#ffffff] shadow-xs font-semibold'
                        : 'bg-[#1e1e1e] border-[#383838] text-[#cbd5e1] hover:bg-[#2e2e2e]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="root_cause"
                      checked={suspectedRootCause === opt.id}
                      onChange={() => setSuspectedRootCause(opt.id)}
                      className="mt-0.5 text-[#ffa116] focus:ring-[#ffa116]"
                    />
                    <span className="text-xs leading-relaxed">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Progressive Hints */}
          {activeTab === 'hints' && (
            <div className="p-5 overflow-y-auto space-y-3 text-xs text-[#cbd5e1] flex-1">
              <p className="text-[#9ca3af] text-[11px]">
                Stuck? Unlock hints progressively. The complete fix is never spoiled automatically.
              </p>

              {challenge.hints.map((hint) => {
                const isUnlocked = unlockedHints.includes(hint.level);
                return (
                  <div
                    key={hint.level}
                    className="p-4 rounded-xl border border-[#383838] bg-[#1e1e1e] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#ffffff] flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                        {hint.title || `Hint ${hint.level}`}
                      </span>
                      {!isUnlocked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnlockHint(hint.level)}
                          className="h-6 text-[10px] bg-[#262626] border-[#383838] text-[#eff2f6] hover:border-[#ffa116]"
                        >
                          Unlock Hint
                        </Button>
                      )}
                    </div>
                    {isUnlocked ? (
                      <p className="text-[#cbd5e1] leading-relaxed text-[11px] pt-1">
                        {hint.content}
                      </p>
                    ) : (
                      <span className="text-[11px] text-[#9ca3af] italic">
                        Click 'Unlock Hint' to reveal diagnostic advice.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Monaco Code Editor + Output Panel */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-hidden min-h-0">
          {/* Editor Container */}
          <div className="flex-1 flex flex-col rounded-2xl border border-[#383838] bg-[#262626] overflow-hidden min-h-0 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#1e1e1e] text-xs text-[#9ca3af]">
              <span className="font-mono font-semibold text-[#ffffff]">solution.py (Editable)</span>
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-[#ffa116] transition-colors font-medium"
                title="Reset starter code"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Code
              </button>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
              <Editor
                height="100%"
                language="python"
                value={code}
                theme="vs-dark"
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 14,
                  tabSize: 4,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: 'on',
                  fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, 'Courier New', monospace",
                  cursorBlinking: 'smooth',
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          {/* Execution Console: Run Results */}
          <div className="h-56 rounded-2xl border border-[#383838] bg-[#262626] flex flex-col overflow-hidden shrink-0 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#1e1e1e] text-xs">
              <span className="font-bold text-[#ffffff] flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#ffa116]" />
                Reproduction Test Console
              </span>
              {runResult && (
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    runResult.all_passed
                      ? 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/30'
                      : 'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/30'
                  }`}
                >
                  {runResult.passed_tests}/{runResult.total_tests} Passed ({runResult.execution_time_ms}ms)
                </span>
              )}
            </div>

            <div className="p-3.5 overflow-y-auto space-y-2 text-xs flex-1 font-mono bg-[#1a1a1a]">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-[#9ca3af] animate-pulse py-4 justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-[#ffa116] border-t-transparent animate-spin" />
                  Running reproduction tests in Python sandbox...
                </div>
              ) : runResult ? (
                <div className="space-y-2">
                  {runResult.test_results.map((tr, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-[11px] ${
                        tr.passed
                          ? 'bg-[#00b8a3]/10 border-[#00b8a3]/30 text-[#00b8a3]'
                          : 'bg-[#ff375f]/10 border-[#ff375f]/30 text-[#ff375f]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 font-sans text-[#ffffff]">
                          {tr.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00b8a3]" /> : <XCircle className="h-3.5 w-3.5 text-[#ff375f]" />}
                          {tr.description}
                        </span>
                        <span className="text-[#9ca3af] font-mono">{tr.execution_time_ms}ms</span>
                      </div>
                      {!tr.passed && (
                        <div className="mt-2 space-y-1 text-[11px] text-[#cbd5e1] bg-[#1e1e1e] border border-[#ff375f]/30 p-2.5 rounded-lg">
                          {tr.stderr && <p className="text-[#ff375f] font-semibold">{tr.stderr}</p>}
                          <p>Expected: <span className="text-[#00b8a3] font-bold">{tr.expected_output}</span></p>
                          <p>Actual: <span className="text-[#ff375f] font-bold">{tr.actual_output || '<empty>'}</span></p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-[#9ca3af] text-xs py-4 font-sans">
                  Click 'Run Repro Tests' to verify reproduction in isolated Python environment.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Report Modal */}
      {isReportOpen && submissionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl border border-[#383838] bg-[#262626] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-[#eff2f6]">
            <div className="flex items-start justify-between pb-3 border-b border-[#383838]">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    submissionResult.is_bug_fixed
                      ? 'bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/30'
                      : 'bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/30'
                  }`}
                >
                  {submissionResult.is_bug_fixed ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#ffffff]">
                    {submissionResult.is_bug_fixed ? 'Bug Successfully Fixed!' : 'Correction Incomplete'}
                  </h2>
                  <span className="text-xs text-[#9ca3af]">
                    Deterministic Test Score: {Math.round(submissionResult.score * 100)}% ({submissionResult.passed_tests}/{submissionResult.total_tests} tests)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-[#9ca3af] hover:text-[#ffffff] transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Invariant & Verification Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838] text-center">
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">
                  Bug Corrected
                </span>
                <span
                  className={`text-xs font-bold ${
                    submissionResult.is_bug_fixed ? 'text-[#00b8a3]' : 'text-[#ff375f]'
                  }`}
                >
                  {submissionResult.is_bug_fixed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838] text-center">
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">
                  Regressions Safe
                </span>
                <span
                  className={`text-xs font-bold ${
                    submissionResult.regressions_passed ? 'text-[#00b8a3]' : 'text-[#ff375f]'
                  }`}
                >
                  {submissionResult.regressions_passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838] text-center">
                <span className="text-[10px] uppercase font-bold text-[#9ca3af] block">
                  Hidden Edge Cases
                </span>
                <span
                  className={`text-xs font-bold ${
                    submissionResult.edge_cases_passed ? 'text-[#00b8a3]' : 'text-[#ff375f]'
                  }`}
                >
                  {submissionResult.edge_cases_passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Streak & Badges Updated */}
            {submissionResult.streak_updated && (
              <div className="p-3.5 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#ffa116] fill-[#ffa116]" />
                  <span className="text-xs font-bold text-[#ffffff]">
                    Daily Streak Active: {submissionResult.streak_updated.current_streak} Days
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#ffa116]">
                  +{100} XP Earned
                </span>
              </div>
            )}

            {/* Advisory AI Review */}
            {submissionResult.ai_review && (
              <div className="p-4 rounded-xl bg-[#1e1e1e] border border-[#383838] space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffa116] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Advisory Root-Cause Analysis
                </span>
                {submissionResult.ai_review.root_cause_explanation && (
                  <p className="text-[#cbd5e1] leading-relaxed">
                    {submissionResult.ai_review.root_cause_explanation}
                  </p>
                )}
                {submissionResult.ai_review.anti_pattern_flag && (
                  <div className="p-2.5 rounded-lg bg-[#ff375f]/10 text-[#ff375f] text-[11px] border border-[#ff375f]/30 font-medium">
                    <strong>Anti-pattern Detected:</strong> {submissionResult.ai_review.anti_pattern_flag}
                  </div>
                )}
                <span className="text-[10px] text-[#9ca3af] italic block">
                  {submissionResult.ai_review.advisory_notice || 'Advisory diagnostic observation.'}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#383838]">
              <Link to="/dashboard/bughunter">
                <Button variant="outline" size="sm" className="text-xs border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:bg-[#2e2e2e]">
                  Back to BugHunter Catalog
                </Button>
              </Link>
              <Button size="sm" onClick={() => setIsReportOpen(false)} className="text-xs bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold">
                Continue Editing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BugHunterArena;
