import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Brain,
  Send,
  Clock,
  CheckCircle2,
  FileCode,
  Award,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

interface InterviewTurn {
  id: string;
  sender: 'interviewer' | 'candidate';
  message: string;
  turn_index: number;
  created_at: string;
}

interface ScorecardData {
  score: number;
  recommendation: string;
  problem_solving_score: number;
  algorithmic_efficiency_score: number;
  code_quality_score: number;
  communication_score: number;
  summary: string;
  strengths: string[];
  growth_areas: string[];
}

interface InterviewSession {
  id: string;
  title: string;
  role_target: string;
  difficulty: string;
  status: string;
  duration_seconds: number;
  problem_description: string;
  initial_code: string;
  final_code: string | null;
  language: string;
  score: number | null;
  recommendation: string | null;
  feedback: string | null;
  turns: InterviewTurn[];
}

export function InterviewArena() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [code, setCode] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [showScorecard, setShowScorecard] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize or fetch active session
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      try {
        const list = await apiClient<InterviewSession[]>('/interview/sessions');
        const active = list.find((s) => s.status === 'in_progress');

        if (active) {
          setSession(active);
          setCode(active.final_code || active.initial_code || '');
          if (active.feedback) {
            try {
              setScorecard(JSON.parse(active.feedback));
            } catch {}
          }
        } else {
          // Create new session
          const newSession = await apiClient<InterviewSession>('/interview/sessions', {
            method: 'POST',
            body: JSON.stringify({
              role_target: 'Senior Backend Engineer',
              difficulty: 'medium',
            }),
          });
          setSession(newSession);
          setCode(newSession.initial_code || '');
        }
      } catch (err) {
        console.error('Failed to init interview session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [user]);

  // Timer
  useEffect(() => {
    if (session?.status !== 'in_progress') return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.turns]);

  const handleSendMessage = async (customMsg?: string) => {
    const text = customMsg || inputText;
    if (!text.trim() || !session || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      const updated = await apiClient<InterviewSession>(`/interview/sessions/${session.id}/message`, {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          current_code: code,
        }),
      });
      setSession(updated);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!session || isCompleting) return;
    setIsCompleting(true);

    try {
      const updated = await apiClient<InterviewSession>(`/interview/sessions/${session.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ final_code: code }),
      });
      setSession(updated);
      if (updated.feedback) {
        try {
          const parsed = JSON.parse(updated.feedback);
          setScorecard(parsed);
          setShowScorecard(true);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to complete interview:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-8 w-8 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9ca3af] font-medium">Connecting to InterviewX AI Principal Interviewer...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] space-y-3 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-2xs">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#ffffff]">{session?.title || 'Technical Interview'}</h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {session?.role_target}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20">
                {session?.difficulty}
              </span>
            </div>
            <div className="text-[11px] text-[#9ca3af] flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 font-mono font-medium text-[#d1d5db]">
                <Clock className="h-3 w-3 text-[#9ca3af]" />
                {formatTimer(secondsElapsed)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#00b8a3] font-medium">
                <span className="h-2 w-2 rounded-full bg-[#00b8a3] animate-pulse" />
                Live Conversational Evaluation
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.status === 'completed' ? (
            <Button
              size="sm"
              onClick={() => setShowScorecard(true)}
              className="h-8 gap-1.5 text-xs font-semibold bg-[#00b8a3] hover:bg-[#009b88] text-white"
            >
              <Award className="h-3.5 w-3.5" />
              View Final Scorecard
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleCompleteInterview}
              disabled={isCompleting}
              className="h-8 gap-1.5 text-xs font-semibold bg-[#ffa116] hover:bg-[#ffb43a] text-black shadow-xs font-bold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isCompleting ? 'Evaluating Session...' : 'Conclude & Submit Interview'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Conversational AI Interview Dialogue */}
        <div className="lg:col-span-5 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm flex flex-col overflow-hidden min-h-0">
          <div className="px-4 py-2.5 border-b border-[#383838] bg-[#1e1e1e] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#ffffff] flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
              Interview Dialogue
            </span>
            <span className="text-[11px] text-[#9ca3af]">
              {session?.turns.length || 0} turns recorded
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#1a1a1a]">
            {session?.turns.map((turn) => {
              const isInterviewer = turn.sender === 'interviewer';
              return (
                <div
                  key={turn.id}
                  className={`flex gap-2.5 ${isInterviewer ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isInterviewer
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40'
                    }`}
                  >
                    {isInterviewer ? 'AI' : (user?.displayName?.slice(0, 1) || 'U')}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isInterviewer
                        ? 'bg-[#262626] text-[#eff2f6] border border-[#383838]'
                        : 'bg-[#ffa116]/15 text-[#ffffff] border border-[#ffa116]/30 shadow-xs'
                    }`}
                  >
                    <div className="font-bold text-[10px] uppercase opacity-80 mb-1 text-[#9ca3af]">
                      {isInterviewer ? 'Principal Interviewer' : (user?.displayName || 'Candidate')}
                    </div>
                    <div className="whitespace-pre-wrap">{turn.message}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pill */}
          <div className="px-3 py-2 border-t border-[#383838] bg-[#1e1e1e] flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-[#9ca3af] text-[10px] uppercase font-semibold shrink-0">Quick prompts:</span>
            <button
              onClick={() => handleSendMessage('Let me walk through the Big-O time and space complexity trade-offs.')}
              className="px-2.5 py-1 rounded-full bg-[#262626] border border-[#383838] text-[#d1d5db] hover:text-[#ffa116] hover:border-[#ffa116] shrink-0 transition-colors"
            >
              Big-O Complexity
            </button>
            <button
              onClick={() => handleSendMessage('How should we handle concurrency and race conditions in a multi-threaded setup?')}
              className="px-2.5 py-1 rounded-full bg-[#262626] border border-[#383838] text-[#d1d5db] hover:text-[#ffa116] hover:border-[#ffa116] shrink-0 transition-colors"
            >
              Concurrency & Locks
            </button>
            <button
              onClick={() => handleSendMessage('What boundary edge cases should we test for first?')}
              className="px-2.5 py-1 rounded-full bg-[#262626] border border-[#383838] text-[#d1d5db] hover:text-[#ffa116] hover:border-[#ffa116] shrink-0 transition-colors"
            >
              Edge Cases
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-[#383838] bg-[#262626]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={session?.status === 'completed' || isSending}
                placeholder={
                  session?.status === 'completed'
                    ? 'Interview completed. Review scorecard.'
                    : 'Respond to interviewer or explain your thought process... (Enter to send)'
                }
                rows={2}
                className="flex-1 p-2.5 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#ffa116] focus:border-[#ffa116] resize-none"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputText.trim() || isSending || session?.status === 'completed'}
                className="h-10 px-3 bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Problem Specification + Monaco Code Editor */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-hidden min-h-0">
          {/* Problem Spec Card */}
          <div className="rounded-2xl border border-[#383838] bg-[#262626] p-4 shadow-sm space-y-2 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffffff] flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5 text-[#ffa116]" />
              Problem Specification
            </h3>
            <div className="whitespace-pre-wrap text-xs text-[#cbd5e1] leading-relaxed font-sans">
              {session?.problem_description}
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 flex flex-col rounded-2xl border border-[#383838] bg-[#262626] overflow-hidden min-h-0 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#1e1e1e] text-xs text-[#9ca3af]">
              <span className="font-mono font-semibold text-[#ffffff]">solution.py</span>
              <span className="text-[11px] text-[#9ca3af]">Live editor attached to interview context</span>
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
                  folding: true,
                  fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, 'Courier New', monospace",
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scorecard Modal */}
      {showScorecard && scorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#262626] rounded-2xl border border-[#383838] max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-[#eff2f6]">
            <div className="flex items-center justify-between pb-4 border-b border-[#383838]">
              <div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  InterviewX Comprehensive Scorecard
                </span>
                <h2 className="text-xl font-bold text-[#ffffff] mt-1">{session?.title}</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-[#ffa116]">{scorecard.score}/100</div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/30 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {scorecard.recommendation}
                </span>
              </div>
            </div>

            {/* 4-Pillar Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Decomposition</span>
                <p className="text-lg font-bold text-[#ffffff] mt-0.5">{scorecard.problem_solving_score}/25</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Big-O Optimality</span>
                <p className="text-lg font-bold text-[#ffffff] mt-0.5">{scorecard.algorithmic_efficiency_score}/25</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Code Correctness</span>
                <p className="text-lg font-bold text-[#ffffff] mt-0.5">{scorecard.code_quality_score}/25</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Communication</span>
                <p className="text-lg font-bold text-[#ffffff] mt-0.5">{scorecard.communication_score}/25</p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5 text-xs text-[#cbd5e1] leading-relaxed">
              <h4 className="font-bold uppercase tracking-wider text-[#ffffff]">Executive Summary</h4>
              <p className="p-3 rounded-xl bg-[#1e1e1e] border border-[#383838]">{scorecard.summary}</p>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-[#00b8a3] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 text-[#cbd5e1]">
                  {scorecard.strengths.map((s, i) => (
                    <li key={i} className="p-2 rounded-lg bg-[#00b8a3]/10 border border-[#00b8a3]/20 flex items-start gap-1.5">
                      <span>•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#ffa116] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#ffa116]" />
                  Growth Opportunities
                </h4>
                <ul className="space-y-1.5 text-[#cbd5e1]">
                  {scorecard.growth_areas.map((g, i) => (
                    <li key={i} className="p-2 rounded-lg bg-[#ffa116]/10 border border-[#ffa116]/20 flex items-start gap-1.5">
                      <span>•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#383838]">
              <Button variant="outline" size="sm" onClick={() => setShowScorecard(false)} className="border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:bg-[#2e2e2e]">
                Review Workspace
              </Button>
              <Button size="sm" onClick={() => navigate('/dashboard/analytics')} className="bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold">
                View in SkillGraph Analytics
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

