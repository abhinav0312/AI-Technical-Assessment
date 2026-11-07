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
    } catch (err: any) {
      console.error('DevSim submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = (file: string) => {
    return scenario?.read_only_files.includes(file) || false;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Provisioning isolated multi-file workspace...
        </p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-base font-bold text-white">Scenario not found</h2>
        <Link to="/dashboard/devsim">
          <Button variant="outline" size="sm">
            Back to Scenarios
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] space-y-3 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-border/70 bg-surface-card shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/devsim"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Scenarios</span>
          </Link>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-bold text-white">{scenario.title}</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-darkest border border-border text-muted-foreground">
              {scenario.scenario_type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Run Tests Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunTests}
            disabled={isExecuting || isSubmitting}
            className="h-8 gap-1.5 text-xs border-teal-500/30 text-teal-300 hover:bg-teal-500/10 font-semibold"
          >
            <Play className={`h-3 w-3 ${isExecuting ? 'animate-spin' : ''}`} />
            Run Test Suite
          </Button>

          {/* Submit Assessment Button */}
          <Button
            size="sm"
            onClick={handleSubmitAssessment}
            disabled={isExecuting || isSubmitting}
            className="h-8 gap-1.5 text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md shadow-teal-600/20"
          >
            <Send className="h-3 w-3" />
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Left Instructions & Files, Center/Right Monaco Editor & Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Task Instructions & File Explorer */}
        <div className="lg:col-span-4 rounded-xl border border-border/70 bg-surface-card flex flex-col overflow-hidden min-h-0">
          <div className="p-2 border-b border-border/50 bg-surface-darkest/70 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftTab('instructions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  leftTab === 'instructions'
                    ? 'bg-surface-dark text-white border border-border/60 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-200'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5 text-teal-400" />
                Instructions
              </button>
              <button
                onClick={() => setLeftTab('files')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  leftTab === 'files'
                    ? 'bg-surface-dark text-white border border-border/60 shadow-sm'
                    : 'text-muted-foreground hover:text-slate-200'
                }`}
              >
                <FolderTree className="h-3.5 w-3.5 text-sky-400" />
                Workspace Files
              </button>
            </div>
          </div>

          {/* Tab 1: Task Instructions */}
          {leftTab === 'instructions' && (
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-200 flex-1">
              {/* Business Context */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Business Context
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{scenario.business_context}</p>
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Engineering Task
                </span>
                <div className="p-3 rounded-lg bg-surface-darkest border border-border/50 text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {scenario.task_description}
                </div>
              </div>

              {/* Acceptance Criteria Checklist */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Acceptance Criteria
                </span>
                <div className="space-y-1.5">
                  {scenario.acceptance_criteria.map((crit, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-surface-darkest border border-border/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      <span className="text-slate-300 text-[11px] leading-relaxed">{crit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Workspace File Tree */}
          {leftTab === 'files' && (
            <div className="p-4 overflow-y-auto space-y-2 text-xs flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
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
                          ? 'bg-teal-950/30 border border-teal-500/40 text-white font-medium'
                          : 'text-slate-300 hover:bg-surface-dark hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="font-mono text-xs truncate">{filename}</span>
                      </div>
                      {readOnly && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-surface-darkest px-1.5 py-0.5 rounded border border-border/40">
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
          <div className="flex-1 flex flex-col rounded-xl border border-border/70 bg-surface-darkest overflow-hidden min-h-0">
            {/* File Tabs */}
            <div className="flex items-center justify-between px-2 pt-1 border-b border-border/50 bg-surface-dark text-xs">
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
                          ? 'bg-surface-darkest border-border text-white font-bold'
                          : 'bg-surface-dark border-transparent text-muted-foreground hover:text-slate-200'
                      }`}
                    >
                      <span>{tab}</span>
                      {readOnly && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                      {openTabs.length > 1 && (
                        <button
                          onClick={(e) => handleCloseTab(e, tab)}
                          className="hover:text-rose-400 ml-1 text-muted-foreground text-[10px]"
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
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-white px-2 py-1 transition-colors"
                  title="Reset file content"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset File
                </button>
              )}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 w-full min-h-0 relative">
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
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Select a file from the workspace file tree to view or edit.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Isolated Terminal Output Panel (Not Simulated!) */}
          <div className="h-48 rounded-xl border border-border/70 bg-surface-card flex flex-col overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface-darkest text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-teal-400" />
                Isolated Sandbox Test Console
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({scenario.entrypoint_command})
                </span>
              </span>
              {runResult && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    runResult.passed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  Exit Code: {runResult.exit_code} ({runResult.execution_time_ms}ms)
                </span>
              )}
            </div>

            <div className="p-3 overflow-y-auto space-y-1 text-xs flex-1 font-mono bg-black/40 text-slate-200">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                  <div className="h-3 w-3 rounded-full border border-teal-500 border-t-transparent animate-spin" />
                  Spinning up isolated ephemeral workspace and executing test suite...
                </div>
              ) : runResult ? (
                <div className="space-y-1">
                  {runResult.stdout && (
                    <pre className="text-emerald-400 whitespace-pre-wrap">{runResult.stdout}</pre>
                  )}
                  {runResult.stderr && (
                    <pre className="text-rose-400 whitespace-pre-wrap">{runResult.stderr}</pre>
                  )}
                  {!runResult.stdout && !runResult.stderr && (
                    <span className="text-muted-foreground">Process completed with no output.</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-[11px]">
                  Click 'Run Test Suite' to launch isolated execution in sandbox.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Evaluation Report Modal */}
      {isReportOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl border border-teal-500/30 bg-surface-card p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-border/50">
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
                  <h2 className="text-lg font-bold text-white">
                    DevSim Evaluation Report: {report.scenario_title}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Functional Score: {Math.round(report.functional_score * 100)}% ({report.acceptance_tests_passed}/{report.total_acceptance_tests} acceptance criteria passed)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReportOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Rubric Score Bars */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                Engineering Rubric Scores
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(report.rubric_scores).map(([rubricKey, score]) => (
                  <div key={rubricKey} className="p-2.5 rounded-lg bg-surface-darkest border border-border/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block capitalize">
                      {rubricKey}
                    </span>
                    <span className="text-sm font-bold font-mono text-teal-300">
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance Test Output */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Acceptance Test Execution Output
              </span>
              <div className="p-3 rounded-lg bg-surface-darkest border border-border/50 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {report.test_output}
              </div>
            </div>

            {/* Advisory AI Engineering Review */}
            {report.ai_review && (
              <div className="p-4 rounded-xl bg-surface-darkest border border-border/60 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Advisory AI Engineering Review
                </span>

                {report.ai_review.maintainability_observations && report.ai_review.maintainability_observations.length > 0 && (
                  <div className="space-y-1">
                    <strong className="text-slate-200">Maintainability Observations:</strong>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                      {report.ai_review.maintainability_observations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.ai_review.fragile_code_flags && report.ai_review.fragile_code_flags.length > 0 && (
                  <div className="p-2.5 rounded bg-rose-950/20 text-rose-300 text-[11px] border border-rose-500/20 space-y-0.5">
                    <strong>Fragility Flags:</strong>
                    {report.ai_review.fragile_code_flags.map((flag, idx) => (
                      <p key={idx}>· {flag}</p>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-muted-foreground italic block pt-1">
                  {report.ai_review.advisory_disclaimer || 'AI review observations are advisory and do not overwrite deterministic test results.'}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Link to="/dashboard/devsim">
                <Button variant="outline" size="sm" className="text-xs">
                  Back to Scenarios
                </Button>
              </Link>
              <Button size="sm" onClick={() => setIsReportOpen(false)} className="text-xs">
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
