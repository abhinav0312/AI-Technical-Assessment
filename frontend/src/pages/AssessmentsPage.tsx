import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileCheck2, ArrowRight, CheckCircle2, Code2, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';
import { Challenge } from '@/types/challenge';
import { Submission } from '@/types/submission';

export function AssessmentsPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cRes, sRes] = await Promise.allSettled([
          apiClient<{ items: Challenge[] }>('/challenges?page_size=20'),
          apiClient<{ items: Submission[] }>('/submissions?page_size=20'),
        ]);

        if (cRes.status === 'fulfilled' && cRes.value?.items) {
          setChallenges(cRes.value.items);
        }
        if (sRes.status === 'fulfilled' && sRes.value?.items) {
          setSubmissions(sRes.value.items);
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Map submissions by challenge_id to get latest score and status
  const submissionMap = new Map<string, Submission>();
  for (const s of submissions) {
    if (!submissionMap.has(s.challenge_id)) {
      submissionMap.set(s.challenge_id, s);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#eff2f6]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#383838]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ffffff] flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-[#ffa116]" />
            My Assessments & Quests
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Track active evaluations, cognitive telemetry scores, and verified algorithmic submissions.
          </p>
        </div>

        <Link to="/challenges">
          <Button size="sm" className="gap-1.5 shadow-xs bg-[#ffa116] hover:bg-[#f59e0b] text-black font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Explore Quest Bank
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-[#383838] bg-[#262626] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1e1e] border-b border-[#383838] text-[#9ca3af] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Quest Title</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Best Score</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333] text-[#d1d5db]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9ca3af]">
                    Loading your assessment data...
                  </td>
                </tr>
              ) : challenges.length > 0 ? (
                challenges.map((c) => {
                  const sub = submissionMap.get(c.id);
                  const isSolved = c.user_status === 'completed' || sub?.status === 'accepted';
                  const hasAttempt = !isSolved && (!!sub || c.user_status === 'attempted');

                  return (
                    <tr key={c.id} className="hover:bg-[#2d2d2d] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#ffffff]">
                        <div className="flex items-center gap-2.5">
                          <Code2 className="h-4 w-4 text-[#ffa116]" />
                          <span className="hover:text-[#ffa116] transition-colors cursor-pointer">{c.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#9ca3af] capitalize">{c.category?.replace('_', ' ')}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            c.difficulty === 'hard'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : c.difficulty === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {c.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            isSolved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : hasAttempt
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : 'bg-[#333333] text-[#9ca3af] border-[#444444]'
                          }`}
                        >
                          {isSolved && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          {isSolved ? 'Solved' : hasAttempt ? 'In Progress' : 'Available'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {sub?.score !== undefined ? (
                          <span className={sub.score === 100 ? 'text-emerald-400 font-bold' : 'text-[#ffffff]'}>
                            {sub.score}%
                          </span>
                        ) : (
                          <span className="text-[#6b7280]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link to={`/dashboard/arena?challenge=${c.slug}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#ffa116] hover:text-[#ffb84d] hover:bg-[#ffa116]/10 font-bold">
                            {isSolved ? 'Review Solution' : hasAttempt ? 'Continue Quest' : 'Start Quest'}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9ca3af]">
                    No assessments or quests assigned yet. Check back soon!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
