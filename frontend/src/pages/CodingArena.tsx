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

export type SupportedLanguage = 'python' | 'typescript' | 'javascript' | 'c' | 'cpp' | 'java';

const STARTER_TEMPLATES: Record<SupportedLanguage, string> = {
  python: `def solve():
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()
`,
  typescript: `function solve(): void {
    // Write your solution here
}

solve();
`,
  javascript: `function solve() {
    // Write your solution here
}

solve();
`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Read input and output solution
    return 0;
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input and output solution
    return 0;
}
`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Solution implementation
    }
}
`,
};

export function CodingArena() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active challenge slug from query param or default to two-sum-target-pair / sliding-window-rate-limiter
  const challengeSlug = searchParams.get('challenge') || 'two-sum-target-pair';

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabSize, setTabSize] = useState<number>(4);

  // Custom Input State
  const [customInput, setCustomInput] = useState<string>('');
  const [useCustomInput, setUseCustomInput] = useState<boolean>(false);

  // Draft persistence state
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const draftDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Left panel view tab: Problem Specification vs ThinkTrace Reasoning
  const [leftPanelTab, setLeftPanelTab] = useState<'problem' | 'thinktrace'>('problem');

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'custom_input' | 'submissions'>('console');
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
  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    setTabSize(lang === 'python' ? 4 : 2);

    if (challenge?.starter_code && challenge.starter_code[lang]) {
      setCode(challenge.starter_code[lang]);
    } else {
      setCode(STARTER_TEMPLATES[lang] || '# Write your solution here\n');
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
    const starter = challenge.starter_code?.[selectedLanguage] || STARTER_TEMPLATES[selectedLanguage] || '';
    triggerDraftSave(starter);
  };

  // Manual Execution against Public Sample Tests or Custom Input
  const handleRunSampleTests = async (withCustom: boolean = false) => {
    if (!challenge || isExecuting) return;
    setIsExecuting(true);
    setActiveTab('console');
    setSampleRunResult(null);
    setActiveSubmission(null);

    const payload: { language: string; source_code: string; custom_input?: string } = {
      language: selectedLanguage,
      source_code: code,
    };

    if (withCustom || (useCustomInput && customInput.trim().length > 0)) {
      payload.custom_input = customInput;
    }

    try {
      const res = await apiClient<EvaluationSummary>(`/challenges/${challenge.slug}/run-sample`, {
        method: 'POST',
        body: JSON.stringify(payload),
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
        error_message: err.message || 'Error executing tests in isolated sandbox.',
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
      ? 'bg-rose-50 text-[#ff375f] border-rose-200'
      : challenge?.difficulty === 'medium'
      ? 'bg-amber-50 text-[#ffc01e] border-amber-200'
      : 'bg-emerald-50 text-[#00b8a3] border-emerald-200';

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] space-y-2.5 font-sans" onKeyDown={handleKeyDown}>
      {/* Top LeetCode Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border border-[#383838] bg-[#262626] shadow-md text-white">
        <div className="flex items-center gap-2.5">
          <Link
            to="/challenges"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#383838] bg-[#1e1e1e] hover:bg-[#333333] text-xs font-semibold text-neutral-200 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Problem List</span>
          </Link>

          {/* Prev / Next */}
          <div className="flex items-center gap-0.5 border border-[#383838] rounded-lg p-0.5 bg-[#1e1e1e]">
            {challenge?.prev_challenge_slug ? (
              <button
                onClick={() => setSearchParams({ challenge: challenge.prev_challenge_slug! })}
                className="p-1 rounded hover:bg-[#333333] text-neutral-300 transition-colors"
                title="Previous Problem"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            ) : null}

            {challenge?.next_challenge_slug ? (
              <button
                onClick={() => setSearchParams({ challenge: challenge.next_challenge_slug! })}
                className="p-1 rounded hover:bg-[#333333] text-neutral-300 transition-colors"
                title="Next Problem"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-[#383838]">
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              {challenge?.title || 'Loading Quest...'}
            </h1>
            {challenge && (
              <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full border ${difficultyColor}`}>
                {challenge.difficulty}
              </span>
            )}
            {challenge?.user_status === 'completed' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00b8a3]/20 text-[#00b8a3] border border-[#00b8a3]/40">
                <CheckCircle2 className="h-3 w-3" />
                Solved
              </span>
            )}
          </div>
        </div>

        {/* Action Controls (Run & LeetCode Submit) */}
        <div className="flex items-center gap-2.5">
          {/* Draft indicator */}
          <span className="text-[11px] text-neutral-400 hidden sm:inline-flex items-center gap-1 font-mono">
            {draftStatus === 'saving' && <span className="text-[#ffa116] animate-pulse">Saving...</span>}
            {draftStatus === 'saved' && <span className="text-[#00b8a3]">Saved</span>}
          </span>

          {/* Bookmark Button */}
          {user && challenge && (
            <button
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                challenge.is_bookmarked
                  ? 'bg-[#ffa116]/20 border-[#ffa116]/40 text-[#ffa116]'
                  : 'bg-[#1e1e1e] border-[#383838] text-neutral-400 hover:text-white'
              }`}
              title={challenge.is_bookmarked ? 'Starred' : 'Star problem'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${challenge.is_bookmarked ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Language selector */}
          <div className="flex items-center">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="h-7 px-2 rounded-lg border border-[#383838] bg-[#1e1e1e] text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#ffa116] cursor-pointer"
            >
              <option value="python">Python3</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          {/* LeetCode Run Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRunSampleTests(false)}
            disabled={isExecuting || isLoadingChallenge}
            className="h-7 px-3 gap-1.5 text-xs border-[#383838] bg-[#1e1e1e] text-white hover:bg-[#333333] font-semibold shadow-2xs"
            title="Ctrl+Enter"
          >
            <Play className={`h-3 w-3 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            Run
          </Button>

          {/* LeetCode Iconic Green Submit Button */}
          <Button
            size="sm"
            onClick={handleSubmitSolution}
            disabled={isExecuting || isLoadingChallenge}
            className="h-7 px-3.5 gap-1.5 text-xs font-bold text-white bg-[#2cbb5d] hover:bg-[#259b4e] border border-[#2cbb5d] shadow-2xs"
            title="Ctrl+Shift+Enter"
          >
            <Send className="h-3 w-3" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Problem Statement on Left, Monaco Editor + Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Problem Specification / ThinkTrace AI */}
        <div className="lg:col-span-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-md flex flex-col overflow-hidden min-h-0">
          <div className="p-2 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftPanelTab('problem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  leftPanelTab === 'problem'
                    ? 'bg-[#262626] text-white border border-[#383838] shadow-2xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileCode className="h-3.5 w-3.5 text-[#ffa116]" />
                Problem Spec
              </button>
              <button
                onClick={() => setLeftPanelTab('thinktrace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  leftPanelTab === 'thinktrace'
                    ? 'bg-[#262626] text-purple-300 border border-purple-500/40 shadow-2xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Brain className="h-3.5 w-3.5 text-purple-400" />
                ThinkTrace Reasoning
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 uppercase font-mono">
                  Live
                </span>
              </button>
            </div>
            {leftPanelTab === 'problem' && (
              <Link to="/challenges" className="text-[11px] text-neutral-400 hover:text-[#ffa116] flex items-center gap-1 pr-2 font-medium">
                Browse all
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          {leftPanelTab === 'thinktrace' ? (
            <div className="flex-1 overflow-y-auto p-4 bg-[#262626]">
              {challenge ? (
                <ThinkTracePanel
                  challengeSlug={challenge.slug}
                  sourceCode={code}
                  language={selectedLanguage}
                  requiredFields={challenge.required_reasoning_fields || []}
                />
              ) : (
                <div className="text-neutral-400 text-xs p-4">Loading challenge details...</div>
              )}
            </div>
          ) : (
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-neutral-200 leading-relaxed flex-1 bg-[#262626]">
            {isLoadingChallenge ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-[#333333] rounded w-3/4" />
                <div className="h-20 bg-[#333333] rounded w-full" />
                <div className="h-12 bg-[#333333] rounded w-5/6" />
              </div>
            ) : challenge ? (
              <>
                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Statement</h3>
                  <div className="whitespace-pre-wrap text-neutral-200 font-sans leading-relaxed">
                    {challenge.description}
                  </div>
                </div>

                {/* Constraints */}
                {challenge.constraints && (
                  <div className="space-y-2 pt-3 border-t border-[#383838]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Constraints & Invariants</h3>
                    <div className="p-3 rounded-lg bg-[#1e1e1e] border border-[#383838] font-mono text-[11px] text-neutral-200 whitespace-pre-wrap">
                      {challenge.constraints}
                    </div>
                  </div>
                )}

                {/* Public Sample Test Cases */}
                {challenge.sample_test_cases && challenge.sample_test_cases.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-[#383838]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Sample Test Cases</h3>
                    {challenge.sample_test_cases.map((stc, idx) => (
                      <div key={stc.id} className="rounded-xl border border-[#383838] bg-[#1e1e1e] p-3.5 space-y-2.5">
                        <div className="text-[11px] font-bold text-white">
                          {stc.description || `Example ${idx + 1}`}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-neutral-400">Input:</span>
                          <pre className="p-2.5 rounded-lg bg-[#141414] border border-[#333333] font-mono text-[11px] text-neutral-200 overflow-x-auto whitespace-pre-wrap">
                            {stc.stdin || '<empty stdin>'}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#00b8a3]">Expected Output:</span>
                          <pre className="p-2.5 rounded-lg bg-[#0e2219] border border-[#00b8a3]/30 font-mono text-[11px] text-[#00b8a3] overflow-x-auto whitespace-pre-wrap">
                            {stc.expected_output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="pt-3 border-t border-[#383838] flex flex-wrap gap-1.5">
                    {challenge.tags.map((t) => (
                      <span key={t.id} className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-neutral-300 border border-[#383838] font-medium">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-neutral-400">Challenge not found.</div>
            )}
          </div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-hidden min-h-0">
          {/* Monaco Code Editor Header Bar */}
          <div className="flex-1 flex flex-col rounded-2xl border border-[#383838] bg-[#1e1e1e] overflow-hidden min-h-0 shadow-md">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#181818] text-xs text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-white">
                  {selectedLanguage === 'python' ? 'solution.py' :
                   selectedLanguage === 'typescript' ? 'solution.ts' :
                   selectedLanguage === 'javascript' ? 'solution.js' :
                   selectedLanguage === 'cpp' ? 'solution.cpp' :
                   selectedLanguage === 'c' ? 'solution.c' : 'Solution.java'}
                </span>
                <span className="text-[11px] text-neutral-500 hidden sm:inline font-sans">
                  (Press Ctrl+Enter to test)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Font size toggle */}
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-transparent text-[11px] text-neutral-300 focus:outline-none border-0 cursor-pointer font-medium"
                  title="Editor Font Size"
                >
                  <option value={12} className="bg-[#1e1e1e] text-white">12px</option>
                  <option value={14} className="bg-[#1e1e1e] text-white">14px</option>
                  <option value={16} className="bg-[#1e1e1e] text-white">16px</option>
                  <option value={18} className="bg-[#1e1e1e] text-white">18px</option>
                </select>

                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors font-medium"
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
                language={
                  selectedLanguage === 'python' ? 'python' :
                  selectedLanguage === 'typescript' ? 'typescript' :
                  selectedLanguage === 'javascript' ? 'javascript' :
                  selectedLanguage === 'cpp' ? 'cpp' :
                  selectedLanguage === 'c' ? 'c' : 'java'
                }
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
          <div className="h-64 rounded-2xl border border-[#383838] bg-[#1e1e1e] flex flex-col overflow-hidden shadow-md">
            {/* Console Header Tabs */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#181818] text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors border-b-2 ${
                    activeTab === 'console'
                      ? 'border-[#ffa116] text-[#ffa116]'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Execution Console
                </button>

                <button
                  onClick={() => setActiveTab('custom_input')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors border-b-2 ${
                    activeTab === 'custom_input'
                      ? 'border-[#ffa116] text-[#ffa116]'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  Custom Input
                  {useCustomInput && <span className="h-1.5 w-1.5 rounded-full bg-[#ffa116]" />}
                </button>

                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors border-b-2 ${
                    activeTab === 'submissions'
                      ? 'border-[#ffa116] text-[#ffa116]'
                      : 'border-transparent text-neutral-400 hover:text-white'
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
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      activeSubmission.status === 'accepted'
                        ? 'bg-emerald-50 text-[#2cbb5d] border border-emerald-200'
                        : 'bg-rose-50 text-[#ef4743] border border-rose-200'
                    }`}
                  >
                    {activeSubmission.status === 'accepted' ? <CheckCircle2 className="h-3.5 w-3.5 text-[#2cbb5d]" /> : <XCircle className="h-3.5 w-3.5 text-[#ef4743]" />}
                    {activeSubmission.status === 'accepted' ? 'Accepted' : 'Wrong Answer'} • {activeSubmission.score}%
                  </span>
                ) : sampleRunResult ? (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      sampleRunResult.status === 'accepted'
                        ? 'bg-emerald-50 text-[#2cbb5d] border border-emerald-200'
                        : 'bg-rose-50 text-[#ef4743] border border-rose-200'
                    }`}
                  >
                    {sampleRunResult.status === 'accepted' ? <CheckCircle2 className="h-3.5 w-3.5 text-[#2cbb5d]" /> : <XCircle className="h-3.5 w-3.5 text-[#ef4743]" />}
                    {sampleRunResult.status === 'accepted' ? 'Accepted' : 'Failed'} ({sampleRunResult.passed_tests}/{sampleRunResult.total_tests} Tests)
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
                    <div className="space-y-3 font-sans text-neutral-200">
                      <div className="flex items-center justify-between pb-2 border-b border-[#383838] text-xs">
                        <span className="font-bold text-white">
                          Evaluation Results: {activeSubmission.passed_tests}/{activeSubmission.total_tests} Tests Passed ({activeSubmission.score}%)
                        </span>
                        <span className="text-neutral-400 text-[11px] font-mono">
                          Runtime: {activeSubmission.execution_time_ms} ms
                        </span>
                      </div>

                      {activeSubmission.error_message && (
                        <div className="p-3 rounded-lg bg-[#2a1315] border border-[#ff375f]/40 text-[#ff375f] font-mono text-[11px] whitespace-pre-wrap">
                          {activeSubmission.error_message}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeSubmission.test_results.map((tr, i) => (
                          <div
                            key={tr.id || i}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              tr.status === 'passed'
                                ? 'bg-[#0f241a] border-[#00b8a3]/40 text-[#00b8a3]'
                                : 'bg-[#2a1315] border-[#ff375f]/40 text-[#ff375f]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 font-bold">
                              {tr.status === 'passed' ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00b8a3]" /> : <XCircle className="h-3.5 w-3.5 text-[#ff375f]" />}
                              Test {i + 1} {tr.is_sample ? '(Sample)' : '(Hidden)'}
                            </span>
                            <span className="font-mono text-[11px] text-neutral-400">
                              {tr.execution_time_ms} ms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isExecuting && !activeSubmission && sampleRunResult && (
                    <div className="space-y-3 font-sans text-neutral-200">
                      <div className="flex items-center justify-between pb-2 border-b border-[#383838] text-xs">
                        <span className="font-bold text-white">
                          Sample Run Outcome: {sampleRunResult.passed_tests}/{sampleRunResult.total_tests} Tests Passed
                        </span>
                        <span className="text-neutral-400 text-[11px] font-mono">
                          Total Time: {sampleRunResult.total_execution_time_ms} ms
                        </span>
                      </div>

                      {sampleRunResult.error_message && (
                        <div className="p-3 rounded-lg bg-[#2a1315] border border-[#ff375f]/40 text-[#ff375f] font-mono text-[11px] whitespace-pre-wrap">
                          {sampleRunResult.error_message}
                        </div>
                      )}

                      <div className="space-y-3">
                        {sampleRunResult.test_results.map((tr, i) => (
                          <div key={tr.id || i} className="rounded-xl border border-[#383838] bg-[#141414] p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white flex items-center gap-1.5 font-sans text-xs">
                                {tr.status === 'passed' ? (
                                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
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

              {activeTab === 'custom_input' && (
                <div className="flex flex-col h-full space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={useCustomInput}
                        onChange={(e) => setUseCustomInput(e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      Use custom test input for execution
                    </label>

                    <Button
                      size="sm"
                      onClick={() => handleRunSampleTests(true)}
                      disabled={isExecuting || isLoadingChallenge}
                      className="h-7 text-xs gap-1.5 font-semibold"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      Run with Custom Input
                    </Button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Enter the standard input (stdin) lines that will be passed directly to your program during testing:
                  </p>

                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g.&#10;5&#10;1 2 3 4 5"
                    rows={4}
                    className="flex-1 w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
                  />
                </div>
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
