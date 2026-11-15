import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { apiClient } from '@/lib/api-client';
import {
  DevSimScenario,
  DevSimRunResult,
  DevSimReport,
} from '@/types/devsim';
import {
  Layers,
  Play,
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  FolderTree,
  FileCode,
  Lock,
  ArrowLeft,
  Terminal,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DevSimWorkspace() {
  const { slug } = useParams<{ slug: string }>();
  const [scenario, setScenario] = useState<DevSimScenario | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leftTab, setLeftTab] = useState<'instructions' | 'files'>('instructions');

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<DevSimRunResult | null>(null);
  const [report, setReport] = useState<DevSimReport | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchScenario = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const data = await apiClient<DevSimScenario>(`/devsim/scenarios/${slug}`);
      setScenario(data);
      setFiles({ ...data.starter_files });
      const fileNames = Object.keys(data.starter_files);
      const defaultEditable = fileNames.find((f) => !data.read_only_files.includes(f)) || fileNames[0];
      setActiveFile(defaultEditable);
      setOpenTabs([defaultEditable]);
    } catch (err) {
      console.error('Failed to load DevSim scenario:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchScenario();
  }, [fetchScenario]);

  const handleOpenFile = (filename: string) => {
    if (!openTabs.includes(filename)) {
      setOpenTabs([...openTabs, filename]);
    }
    setActiveFile(filename);
  };

  const handleCloseTab = (e: React.MouseEvent, filename: string) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t !== filename);
    setOpenTabs(remaining);
    if (activeFile === filename) {
      setActiveFile(remaining[0] || '');
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (!activeFile) return;
    setFiles((prev) => ({
      ...prev,
      [activeFile]: newCode,
    }));
  };

  const handleResetActiveFile = () => {
    if (!scenario || !activeFile) return;
    setFiles((prev) => ({
      ...prev,
      [activeFile]: scenario.starter_files[activeFile] || '',
    }));
  };

  const handleRunTests = async () => {
    if (!slug || isExecuting) return;
    setIsExecuting(true);
    setRunResult(null);
    try {
      const res = await apiClient<DevSimRunResult>(`/devsim/scenarios/${slug}/run-tests`, {
        method: 'POST',
        body: JSON.stringify({ modified_files: files }),
      });
      setRunResult(res);
    } catch (err: any) {
      setRunResult({
        stdout: '',
        stderr: err.message || 'Error executing isolated sandbox environment',
        exit_code: 1,
        execution_time_ms: 0,
        is_timed_out: false,
        passed: false,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!slug || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient<DevSimReport>(`/devsim/scenarios/${slug}/submit`, {
        method: 'POST',
        body: JSON.stringify({ modified_files: files }),
      });
      setReport(res);
      setIsReportOpen(true);
    } catch (err) {
      console.error('Failed to submit DevSim scenario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = (filename: string) => {
    return scenario?.read_only_files.includes(filename) || false;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-[#eff2f6]">
        <div className="h-8 w-8 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9ca3af] font-medium">Mounting multi-file engineering workspace...</p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="p-8 text-center space-y-3 text-[#eff2f6]">
        <h2 className="text-base font-bold text-[#ffffff]">Scenario not found</h2>
        <Link to="/dashboard/devsim">
          <Button variant="outline" size="sm" className="border-[#383838] text-[#ffffff] bg-[#1e1e1e]">
            Back to Scenarios
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-3 overflow-hidden text-[#eff2f6] font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#383838] bg-[#262626] shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/devsim"
            className="flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#ffa116] transition-colors font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Scenarios</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#383838]" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold text-[#ffffff]">{scenario.title}</span>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#383838] text-[#d1d5db]">
              {scenario.scenario_type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Run Tests Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunTests}
            disabled={isExecuting || isSubmitting}
            className="h-8 gap-1.5 text-xs border-[#383838] bg-[#1e1e1e] text-[#ffffff] hover:bg-[#333333] hover:text-[#ffa116] font-bold"
          >
            <Play className={`h-3 w-3 text-[#00b8a3] ${isExecuting ? 'animate-spin' : 'fill-current'}`} />
            Run Test Suite
          </Button>

          {/* Submit Assessment Button */}
          <Button
            size="sm"
            onClick={handleSubmitAssessment}
            disabled={isExecuting || isSubmitting}
            className="h-8 gap-1.5 text-xs bg-[#ffa116] hover:bg-[#f59e0b] text-black font-extrabold shadow-sm"
          >
            <Send className="h-3 w-3" />
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Left Instructions & Files, Center/Right Monaco Editor & Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Task Instructions & File Explorer */}
        <div className="lg:col-span-4 rounded-xl border border-[#383838] bg-[#262626] flex flex-col overflow-hidden min-h-0 shadow-md">
          <div className="p-2 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLeftTab('instructions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  leftTab === 'instructions'
                    ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/40 shadow-xs'
                    : 'text-[#9ca3af] hover:text-[#ffffff]'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Instructions
              </button>
              <button
                onClick={() => setLeftTab('files')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  leftTab === 'files'
                    ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/40 shadow-xs'
                    : 'text-[#9ca3af] hover:text-[#ffffff]'
                }`}
              >
                <FolderTree className="h-3.5 w-3.5" />
                Workspace Files
              </button>
            </div>
          </div>

          {/* Tab 1: Task Instructions */}
          {leftTab === 'instructions' && (
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#eff2f6] flex-1">
              {/* Business Context */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffa116]">
                  Business Context
                </span>
                <p className="text-[#d1d5db] leading-relaxed font-sans text-xs">{scenario.business_context}</p>
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00b8a3]">
                  Engineering Task
                </span>
                <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#383838] text-[#ffffff] whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {scenario.task_description}
                </div>
              </div>

              {/* Acceptance Criteria Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#383838]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffa116]">
                  Acceptance Criteria
                </span>
                <div className="space-y-2">
                  {scenario.acceptance_criteria.map((crit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#1e1e1e] border border-[#383838]">
                      <span className="h-2 w-2 rounded-full bg-[#00b8a3] mt-1 shrink-0" />
                      <span className="text-[#ffffff] text-xs leading-relaxed font-medium">{crit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Workspace File Tree */}
          {leftTab === 'files' && (
            <div className="p-4 overflow-y-auto space-y-2 text-xs flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] block mb-2">
                Project Directory
              </span>
              <div className="space-y-1">
                {Object.keys(files).map((filename) => {
                  const readOnly = isReadOnly(filename);
                  const isCurrent = activeFile === filename;
                  return (
                    <div
                      key={filename}
                      onClick={() => handleOpenFile(filename)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#1e1e1e] border border-[#ffa116]/50 text-[#ffa116] font-bold'
                          : 'text-[#d1d5db] hover:bg-[#1e1e1e] hover:text-[#ffffff]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="h-4 w-4 shrink-0 text-[#9ca3af]" />
                        <span className="font-mono text-xs truncate">{filename}</span>
                      </div>
                      {readOnly && (
                        <span className="flex items-center gap-1 text-[10px] text-[#9ca3af] bg-[#141414] px-1.5 py-0.5 rounded border border-[#383838]">
                          <Lock className="h-2.5 w-2.5" />
                          Read-only
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-tab Monaco Code Editor + Real Terminal Console */}
        <div className="lg:col-span-8 flex flex-col space-y-2.5 overflow-hidden min-h-0">
          {/* Tab Bar & Editor Container */}
          <div className="flex-1 flex flex-col rounded-xl border border-[#383838] bg-[#1e1e1e] overflow-hidden min-h-0 shadow-md">
            {/* File Tabs */}
            <div className="flex items-center justify-between px-2 pt-1.5 border-b border-[#383838] bg-[#141414] text-xs">
              <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                {openTabs.map((tab) => {
                  const isActive = activeFile === tab;
                  const readOnly = isReadOnly(tab);
                  return (
                    <div
                      key={tab}
                      onClick={() => setActiveFile(tab)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg font-mono text-xs cursor-pointer border-t border-l border-r transition-all ${
                        isActive
                          ? 'bg-[#1e1e1e] border-[#383838] border-t-2 border-t-[#ffa116] text-[#ffffff] font-bold'
                          : 'bg-[#141414] border-transparent text-[#9ca3af] hover:text-[#ffffff]'
                      }`}
                    >
                      <span>{tab}</span>
                      {readOnly && <Lock className="h-2.5 w-2.5 text-[#9ca3af]" />}
                      {openTabs.length > 1 && (
                        <button
                          onClick={(e) => handleCloseTab(e, tab)}
                          className="hover:text-rose-400 ml-1 text-[#9ca3af] text-[10px]"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeFile && !isReadOnly(activeFile) && (
                <button
                  onClick={handleResetActiveFile}
                  className="flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-[#ffa116] px-2 py-1 transition-colors"
                  title="Reset file content"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset File
                </button>
              )}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 w-full min-h-0 relative bg-[#1e1e1e]">
              {activeFile ? (
                <Editor
                  height="100%"
                  language={activeFile.endsWith('.py') ? 'python' : activeFile.endsWith('.json') ? 'json' : 'plaintext'}
                  value={files[activeFile] || ''}
                  theme="vs-dark"
                  onChange={(val) => handleCodeChange(val || '')}
                  options={{
                    readOnly: isReadOnly(activeFile),
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
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-[#9ca3af]">
                  Select a file from the workspace file tree to view or edit.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Isolated Terminal Output Panel */}
          <div className="h-48 rounded-xl border border-[#383838] bg-[#262626] flex flex-col overflow-hidden shrink-0 shadow-md">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#1e1e1e] text-xs">
              <span className="font-bold text-[#ffffff] flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-[#ffa116]" />
                Isolated Sandbox Test Console
                <span className="text-[10px] text-[#9ca3af] font-mono">
                  ({scenario.entrypoint_command})
                </span>
              </span>
              {runResult && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    runResult.passed
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  Exit Code: {runResult.exit_code} ({runResult.execution_time_ms}ms)
                </span>
              )}
            </div>

            <div className="p-3.5 overflow-y-auto space-y-1 text-xs flex-1 font-mono bg-[#101010] text-[#e5e7eb]">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-[#ffa116] animate-pulse">
                  <div className="h-3 w-3 rounded-full border border-[#ffa116] border-t-transparent animate-spin" />
                  Spinning up isolated ephemeral workspace and executing test suite...
                </div>
              ) : runResult ? (
                <div className="space-y-1">
                  {runResult.stdout && (
                    <pre className="text-[#34d399] whitespace-pre-wrap">{runResult.stdout}</pre>
                  )}
                  {runResult.stderr && (
                    <pre className="text-[#f87171] whitespace-pre-wrap">{runResult.stderr}</pre>
                  )}
                  {!runResult.stdout && !runResult.stderr && (
                    <span className="text-[#9ca3af]">Process completed with no output.</span>
                  )}
                </div>
              ) : (
                <span className="text-[#9ca3af] text-[11px]">
                  Click 'Run Test Suite' to launch isolated execution in sandbox.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Evaluation Report Modal */}
      {isReportOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl border border-[#383838] bg-[#262626] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-[#eff2f6]">
            <div className="flex items-start justify-between pb-3 border-b border-[#383838]">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    report.acceptance_tests_passed === report.total_acceptance_tests
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {report.acceptance_tests_passed === report.total_acceptance_tests ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#ffffff]">
                    DevSim Evaluation Report: {report.scenario_title}
                  </h2>
                  <span className="text-xs text-[#9ca3af]">
                    Functional Score: <strong className="text-[#ffffff]">{Math.round(report.functional_score * 100)}%</strong> ({report.acceptance_tests_passed}/{report.total_acceptance_tests} acceptance criteria passed)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-[#9ca3af] hover:text-[#ffffff]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Rubric Score Bars */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#ffffff] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#ffa116]" />
                Engineering Rubric Scores
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(report.rubric_scores).map(([rubricKey, score]) => (
                  <div key={rubricKey} className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#9ca3af] block capitalize">
                      {rubricKey}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#ffa116]">
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance Test Output */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                Acceptance Test Execution Output
              </span>
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#383838] font-mono text-[11px] text-[#34d399] max-h-36 overflow-y-auto whitespace-pre-wrap">
                {report.test_output}
              </div>
            </div>

            {/* Advisory AI Engineering Review */}
            {report.ai_review && (
              <div className="p-4 rounded-xl bg-[#1e1e1e] border border-[#383838] space-y-2.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffa116] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  ThinkTrace Advisory Engineering Review
                </span>

                {report.ai_review.maintainability_observations && report.ai_review.maintainability_observations.length > 0 && (
                  <div className="space-y-1">
                    <strong className="text-[#ffffff]">Maintainability Observations:</strong>
                    <ul className="list-disc list-inside text-[#d1d5db] space-y-1 pl-1">
                      {report.ai_review.maintainability_observations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.ai_review.fragile_code_flags && report.ai_review.fragile_code_flags.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-300 text-[11px] border border-rose-500/30 space-y-0.5">
                    <strong className="text-rose-400">Fragility Flags:</strong>
                    {report.ai_review.fragile_code_flags.map((flag, idx) => (
                      <p key={idx}>· {flag}</p>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-[#9ca3af] italic block pt-1">
                  {report.ai_review.advisory_disclaimer || 'AI review observations are advisory and do not overwrite deterministic test results.'}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Link to="/dashboard/devsim">
                <Button variant="outline" size="sm" className="text-xs border-[#383838] bg-[#1e1e1e] text-[#ffffff] hover:bg-[#333333]">
                  Back to Scenarios
                </Button>
              </Link>
              <Button size="sm" onClick={() => setIsReportOpen(false)} className="text-xs bg-[#ffa116] hover:bg-[#f59e0b] text-black font-bold">
                Return to Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevSimWorkspace;
