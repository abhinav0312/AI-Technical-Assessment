import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';
import { Challenge } from '@/types/challenge';
import { Submission, EvaluationSummary } from '@/types/submission';
import {
  Play,
  Send,
  RotateCcw,
  Terminal,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  History,
  FileCode,
  Sparkles,
  ExternalLink,
  Brain,
} from 'lucide-react';
import { ThinkTracePanel } from '@/features/thinktrace/ThinkTracePanel';

export function CodingArena() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active challenge slug from query param or default to two-sum-target-pair / sliding-window-rate-limiter
  const challengeSlug = searchParams.get('challenge') || 'two-sum-target-pair';

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'typescript'>('python');
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabSize, setTabSize] = useState<number>(4);

  // Draft persistence state
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const draftDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Left panel view tab: Problem Specification vs ThinkTrace Reasoning
  const [leftPanelTab, setLeftPanelTab] = useState<'problem' | 'thinktrace'>('problem');

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'submissions' | 'tests'>('console');
  const [sampleRunResult, setSampleRunResult] = useState<EvaluationSummary | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [challengeSubmissions, setChallengeSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Fetch Challenge Details
  const fetchChallenge = useCallback(async (slug: string) => {
    setIsLoadingChallenge(true);
    try {
      const data = await apiClient<Challenge>(`/challenges/${slug}`);
      setChallenge(data);

      // Determine initial language
      const defaultLang = (data.supported_languages && data.supported_languages.includes('python'))
        ? 'python'
        : (data.supported_languages?.[0] as any) || 'python';
      setSelectedLanguage(defaultLang);

      // Use user's saved draft if available, else starter code
      if (data.user_draft) {
        setCode(data.user_draft);
      } else if (data.starter_code && data.starter_code[defaultLang]) {
        setCode(data.starter_code[defaultLang]);
      } else {
        setCode('# Write your solution here\n');
      }
    } catch (err) {
      console.error('Failed to load challenge details:', err);
    } finally {
      setIsLoadingChallenge(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenge(challengeSlug);
  }, [challengeSlug, fetchChallenge]);

  // Fetch Submissions for this challenge
  const fetchSubmissions = useCallback(async () => {
    if (!challenge || !user) return;
    setIsLoadingSubmissions(true);
    try {
      const res = await apiClient<{ items: Submission[] }>(`/submissions?challenge_id=${challenge.id}`);
      if (res && res.items) {
        setChallengeSubmissions(res.items);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [challenge, user]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  // Language Change Handler
  const handleLanguageChange = (lang: 'python' | 'typescript') => {
    setSelectedLanguage(lang);
    setTabSize(lang === 'python' ? 4 : 2);

    if (challenge?.starter_code && challenge.starter_code[lang]) {
      setCode(challenge.starter_code[lang]);
    }
    setSampleRunResult(null);
  };

  // Debounced Draft Persistence
  const triggerDraftSave = (newCode: string) => {
    setCode(newCode);
    setDraftStatus('unsaved');

    if (!user || !challenge) return;

    if (draftDebounceRef.current) {
      clearTimeout(draftDebounceRef.current);
    }

    draftDebounceRef.current = setTimeout(async () => {
      setDraftStatus('saving');
      try {
        await apiClient(`/challenges/${challenge.slug}/draft`, {
          method: 'PUT',
          body: JSON.stringify({
            language: selectedLanguage,
            code: newCode,
          }),
        });
        setDraftStatus('saved');
      } catch {
        setDraftStatus('unsaved');
      }
    }, 1200);
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!challenge || !user) return;
    const current = !!challenge.is_bookmarked;
    setChallenge({ ...challenge, is_bookmarked: !current });
    try {
      await apiClient(`/challenges/${challenge.id}/bookmark`, { method: 'POST' });
    } catch {
      setChallenge({ ...challenge, is_bookmarked: current });
    }
  };

  // Reset starter code
  const handleResetCode = () => {
    if (!challenge) return;
    const starter = challenge.starter_code?.[selectedLanguage] || '';
    triggerDraftSave(starter);
  };

  // Manual Execution against Public Sample Tests
  const handleRunSampleTests = async () => {
    if (!challenge || isExecuting) return;
    setIsExecuting(true);
    setActiveTab('console');
    setSampleRunResult(null);
    setActiveSubmission(null);

    try {
      const res = await apiClient<EvaluationSummary>(`/challenges/${challenge.slug}/run-sample`, {
        method: 'POST',
        body: JSON.stringify({
          language: selectedLanguage,
          source_code: code,
        }),
      });
      setSampleRunResult(res);
    } catch (err: any) {
      setSampleRunResult({
        status: 'runtime_error',
        score: 0,
        total_tests: 0,
        passed_tests: 0,
        total_execution_time_ms: 0,
        max_memory_kb: 0,
        error_message: err.message || 'Error executing sample tests in isolated sandbox.',
        test_results: [],
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Formal Full Submission (Sample + Hidden Tests)
  const handleSubmitSolution = async () => {
    if (!challenge || !user || isExecuting) {
      if (!user) navigate('/login');
      return;
    }

    setIsExecuting(true);
    setActiveTab('console');
    setSampleRunResult(null);

    try {
      // Create submission
      const sub = await apiClient<Submission>('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          challenge_id: challenge.id,
          language: selectedLanguage,
          source_code: code,
        }),
      });

      setActiveSubmission(sub);

      // Poll until background evaluation worker finishes (up to 8 seconds)
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const updated = await apiClient<Submission>(`/submissions/${sub.id}`);
          if (updated.status !== 'queued' && updated.status !== 'evaluating') {
            clearInterval(pollInterval);
            setActiveSubmission(updated);
            setIsExecuting(false);
            fetchSubmissions();
          } else if (attempts >= 16) {
            clearInterval(pollInterval);
            setIsExecuting(false);
          }
        } catch {
          clearInterval(pollInterval);
          setIsExecuting(false);
        }
      }, 500);
    } catch (err: any) {
      setIsExecuting(false);
      console.error('Submission failed:', err);
    }
  };

  // Keyboard Shortcuts: Ctrl+Enter (Run), Ctrl+Shift+Enter (Submit)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitSolution();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunSampleTests();
    }
  };

  const difficultyColor =
    challenge?.difficulty === 'hard'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : challenge?.difficulty === 'medium'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] space-y-3 font-sans" onKeyDown={handleKeyDown}>
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/challenges" className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {challenge?.title || 'Loading challenge...'}
              </h1>
              {challenge && (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${difficultyColor}`}>
                  {challenge.difficulty}
                </span>
              )}
              {challenge?.user_status === 'completed' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Solved
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Category: <strong className="text-slate-700 capitalize">{challenge?.category?.replace('_', ' ')}</strong></span>
              •
              <span>Isolated Sandbox Runtime</span>
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Draft persistence indicator */}
          <span className="text-[11px] text-slate-500 hidden sm:inline-flex items-center gap-1">
            {draftStatus === 'saving' && <span className="text-amber-600 animate-pulse">Saving draft...</span>}
            {draftStatus === 'saved' && <span className="text-emerald-600">✓ Draft saved</span>}
            {draftStatus === 'unsaved' && <span className="text-slate-400">Unsaved changes</span>}
          </span>

          {/* Bookmark Button */}
          {user && challenge && (
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                challenge.is_bookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={challenge.is_bookmarked ? 'Remove bookmark' : 'Bookmark challenge'}
            >
              <Bookmark className={`h-4 w-4 ${challenge.is_bookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Sequence navigation */}
          {challenge?.prev_challenge_slug && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSearchParams({ challenge: challenge.prev_challenge_slug! })}
              className="h-8 px-2 text-xs gap-1 border-slate-200 text-slate-700"
              title="Previous Challenge"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>
          )}

          {challenge?.next_challenge_slug && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSearchParams({ challenge: challenge.next_challenge_slug! })}
              className="h-8 px-2 text-xs gap-1 border-slate-200 text-slate-700"
              title="Next Challenge"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Language selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => handleLanguageChange('python')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedLanguage === 'python' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python 3.12
            </button>
            <button
              onClick={() => handleLanguageChange('typescript')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedLanguage === 'typescript' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TypeScript
            </button>
          </div>

          {/* ThinkTrace AI Quick Toggle */}
          <button
            onClick={() => setLeftPanelTab(leftPanelTab === 'thinktrace' ? 'problem' : 'thinktrace')}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              leftPanelTab === 'thinktrace'
                ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle ThinkTrace Problem Reasoning Capture"
          >
            <Brain className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden sm:inline">ThinkTrace</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-mono">
              AI
            </span>
          </button>

          {/* Run Sample Tests Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunSampleTests}
            disabled={isExecuting || isLoadingChallenge}
            className="h-8 gap-1.5 text-xs border-slate-200 text-slate-800 hover:bg-slate-50 font-semibold"
            title="Shortcut: Ctrl+Enter"
          >
            <Play className={`h-3 w-3 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>

          {/* Submit Solution Button */}
          <Button
            size="sm"
            onClick={handleSubmitSolution}
            disabled={isExecuting || isLoadingChallenge}
            className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
            title="Shortcut: Ctrl+Shift+Enter"
          >
            <Send className="h-3 w-3" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Problem Statement on Left, Monaco Editor + Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Problem Specification / ThinkTrace AI */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col overflow-hidden min-h-0">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftPanelTab('problem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  leftPanelTab === 'problem'
                    ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-brand-600" />
                Problem Spec
              </button>
              <button
                onClick={() => setLeftPanelTab('thinktrace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  leftPanelTab === 'thinktrace'
                    ? 'bg-white text-purple-700 border border-purple-200 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Brain className="h-3.5 w-3.5 text-purple-600" />
                ThinkTrace Reasoning
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 uppercase font-mono">
                  Live
                </span>
              </button>
            </div>
            {leftPanelTab === 'problem' && (
              <Link to="/challenges" className="text-[11px] text-slate-500 hover:text-brand-600 flex items-center gap-1 pr-2 font-medium">
                Browse all
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {leftPanelTab === 'thinktrace' ? (
            <div className="flex-1 overflow-y-auto p-4">
              {challenge ? (
                <ThinkTracePanel
                  challengeSlug={challenge.slug}
                  sourceCode={code}
                  language={selectedLanguage}
                  requiredFields={challenge.required_reasoning_fields || []}
                />
              ) : (
                <div className="text-muted-foreground text-xs p-4">Loading challenge details...</div>
              )}
            </div>
          ) : (
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed flex-1 bg-white">
            {isLoadingChallenge ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-20 bg-slate-100 rounded w-full" />
                <div className="h-12 bg-slate-100 rounded w-5/6" />
              </div>
            ) : challenge ? (
              <>
                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Statement</h3>
                  <div className="whitespace-pre-wrap text-slate-700 font-sans leading-relaxed">
                    {challenge.description}
                  </div>
                </div>

                {/* Constraints */}
                {challenge.constraints && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Constraints & Invariants</h3>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                      {challenge.constraints}
                    </div>
                  </div>
                )}

                {/* Public Sample Test Cases */}
                {challenge.sample_test_cases && challenge.sample_test_cases.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Sample Test Cases</h3>
                    {challenge.sample_test_cases.map((stc, idx) => (
                      <div key={stc.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-800">
                          {stc.description || `Example ${idx + 1}`}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Input:</span>
                          <pre className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto whitespace-pre-wrap">
                            {stc.stdin || '<empty stdin>'}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-700">Expected Output:</span>
                          <pre className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 font-mono text-[11px] text-emerald-900 overflow-x-auto whitespace-pre-wrap">
                            {stc.expected_output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {challenge.tags.map((t) => (
                      <span key={t.id} className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500">Challenge not found.</div>
            )}
          </div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-hidden min-h-0">
          {/* Monaco Code Editor Header Bar */}
          <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-0 shadow-xs">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-slate-800">
                  {selectedLanguage === 'python' ? 'solution.py' : 'solution.ts'}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline font-sans">
                  (Press Ctrl+Enter to test)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Font size toggle */}
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-transparent text-[11px] text-slate-700 focus:outline-none border-0 cursor-pointer font-medium"
                  title="Editor Font Size"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                </select>

                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors font-medium"
                  title="Reset to starter code"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 w-full min-h-0 relative">
              <Editor
                height="100%"
                language={selectedLanguage === 'python' ? 'python' : 'typescript'}
                value={code}
                theme="vs-dark"
                onChange={(val) => triggerDraftSave(val || '')}
                options={{
                  fontSize: fontSize,
                  tabSize: tabSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: 'on',
                  folding: true,
                  fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, 'Courier New', monospace",
                  cursorBlinking: 'smooth',
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          {/* Bottom Execution Console & Results */}
          <div className="h-64 rounded-2xl border border-slate-200 bg-white flex flex-col overflow-hidden shadow-xs">
            {/* Console Header Tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80 text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors border-b-2 ${
                    activeTab === 'console'
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Execution Console
                </button>

                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors border-b-2 ${
                    activeTab === 'submissions'
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Submissions ({challengeSubmissions.length})
                </button>
              </div>

              {/* Status Badge */}
              <div>
                {isExecuting ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                    Executing in sandbox...
                  </span>
                ) : activeSubmission ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      activeSubmission.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {activeSubmission.status === 'accepted' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {activeSubmission.status.replace('_', ' ')} • {activeSubmission.score}%
                  </span>
                ) : sampleRunResult ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      sampleRunResult.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {sampleRunResult.status === 'accepted' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {sampleRunResult.passed_tests}/{sampleRunResult.total_tests} Tests Passed
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Ready</span>
                )}
              </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 overflow-y-auto p-4 text-xs">
              {activeTab === 'console' && (
                <>
                  {isExecuting && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                      <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-medium">Evaluating solution in isolated subprocess sandbox...</p>
                    </div>
                  )}

                  {!isExecuting && activeSubmission && (
                    <div className="space-y-3 font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">
                          Evaluation Results: {activeSubmission.passed_tests}/{activeSubmission.total_tests} Tests Passed ({activeSubmission.score}%)
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">
                          Runtime: {activeSubmission.execution_time_ms} ms
                        </span>
                      </div>

                      {activeSubmission.error_message && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[11px] whitespace-pre-wrap">
                          {activeSubmission.error_message}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeSubmission.test_results.map((tr, i) => (
                          <div
                            key={tr.id || i}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              tr.status === 'passed'
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50/70 border-rose-200 text-rose-800'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 font-medium">
                              {tr.status === 'passed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-rose-600" />}
                              Test {i + 1} {tr.is_sample ? '(Sample)' : '(Hidden)'}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {tr.execution_time_ms} ms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isExecuting && !activeSubmission && sampleRunResult && (
                    <div className="space-y-3 font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                        <span className="font-bold text-slate-900">
                          Sample Run Outcome: {sampleRunResult.passed_tests}/{sampleRunResult.total_tests} Tests Passed
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">
                          Total Time: {sampleRunResult.total_execution_time_ms} ms
                        </span>
                      </div>

                      {sampleRunResult.error_message && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[11px] whitespace-pre-wrap">
                          {sampleRunResult.error_message}
                        </div>
                      )}

                      <div className="space-y-3">
                        {sampleRunResult.test_results.map((tr, i) => (
                          <div key={tr.id || i} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 flex items-center gap-1.5 font-sans text-xs">
                                {tr.status === 'passed' ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-rose-600" />
                                )}
                                Sample Test #{i + 1}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {tr.execution_time_ms} ms
                              </span>
                            </div>

                            {tr.status !== 'passed' && (
                              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                                <div className="space-y-1">
                                  <span className="text-slate-500 text-[10px] uppercase font-bold">Expected:</span>
                                  <pre className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-800 whitespace-pre-wrap overflow-x-auto">
                                    {tr.expected_output}
                                  </pre>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-slate-500 text-[10px] uppercase font-bold">Your Output:</span>
                                  <pre className="p-2 rounded-lg bg-white border border-rose-200 text-rose-800 whitespace-pre-wrap overflow-x-auto">
                                    {tr.actual_output || '<no output>'}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isExecuting && !activeSubmission && !sampleRunResult && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-6">
                      <Terminal className="h-8 w-8 text-slate-400" />
                      <p className="text-xs text-center text-slate-600 max-w-sm">
                        Click <strong className="text-slate-900 font-semibold">Run Tests</strong> (Ctrl+Enter) to evaluate against sample test cases, or <strong className="text-slate-900 font-semibold">Submit</strong> for full evaluation.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-2">
                  {isLoadingSubmissions ? (
                    <div className="py-6 text-center text-slate-400">Loading submissions...</div>
                  ) : challengeSubmissions.length > 0 ? (
                    challengeSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setActiveSubmission(sub);
                          setActiveTab('console');
                        }}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-xs cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              sub.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {sub.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-800 font-semibold font-sans">
                            {sub.passed_tests}/{sub.total_tests} Tests ({sub.score}%)
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                          <span className="capitalize">{sub.language}</span>
                          <span>{sub.execution_time_ms ? `${sub.execution_time_ms} ms` : '—'}</span>
                          <span>{new Date(sub.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 font-sans">
                      No submissions recorded yet for this challenge.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
