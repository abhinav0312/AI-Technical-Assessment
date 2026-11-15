import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, ArrowRight, CheckCircle2, Flame, Award, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';

interface ContestChallenge {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  points: number;
  order_index: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  score: number;
  penalty_seconds: number;
}

interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  participant_count: number;
  challenges: ContestChallenge[];
  is_registered: boolean;
}

export function ContestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allContests, setAllContests] = useState<Contest[]>([]);
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems');

  useEffect(() => {
    async function loadContests() {
      setIsLoading(true);
      try {
        const data = await apiClient<Contest[]>('/contests');
        setAllContests(data);
        if (data.length > 0) {
          const current = data[0];
          setActiveContest(current);
          // Load leaderboard
          const lb = await apiClient<{ entries: LeaderboardEntry[] }>(`/contests/${current.id}/leaderboard`);
          if (lb && lb.entries) {
            setLeaderboard(lb.entries);
          }
        }
      } catch (err) {
        console.error('Failed to load contests:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContests();
  }, [user]);

  const handleRegister = async () => {
    if (!activeContest) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    try {
      await apiClient(`/contests/${activeContest.id}/register`, { method: 'POST' });
      setActiveContest({ ...activeContest, is_registered: true, participant_count: activeContest.participant_count + 1 });
      // Reload leaderboard
      const lb = await apiClient<{ entries: LeaderboardEntry[] }>(`/contests/${activeContest.id}/leaderboard`);
      if (lb && lb.entries) {
        setLeaderboard(lb.entries);
      }
    } catch (err) {
      console.error('Failed to register for contest:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const formatPenalty = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-8 w-8 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9ca3af] font-medium">Loading competitive arena & live standings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#383838] bg-[#262626] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffa116]/10 text-[#ffa116] text-xs font-bold border border-[#ffa116]/30">
              <Flame className="h-3.5 w-3.5 fill-current text-[#ffa116]" />
              LIVE GLOBAL CONTEST
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#ffffff]">
              {activeContest?.title || 'DevMind Global Algorithm Championship'}
            </h1>
            <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-2xl leading-relaxed">
              {activeContest?.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#9ca3af]">
              <span className="flex items-center gap-1.5 font-medium text-[#d1d5db]">
                <Users className="h-4 w-4 text-[#ffa116]" />
                <strong className="text-[#ffffff]">{activeContest?.participant_count}</strong> Registered Participants
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-[#d1d5db]">
                <Clock className="h-4 w-4 text-[#ffa116]" />
                Penalty Rule: 5 min per incorrect submission
              </span>
              {allContests.length > 1 && (
                <span className="text-[11px] font-semibold text-[#9ca3af]">
                  Select Contest:
                  <select
                    value={activeContest?.id}
                    onChange={(e) => {
                      const sel = allContests.find((c) => c.id === e.target.value);
                      if (sel) setActiveContest(sel);
                    }}
                    className="ml-1 text-xs border border-[#383838] bg-[#1e1e1e] rounded-md p-1 font-semibold text-[#ffffff] cursor-pointer"
                  >
                    {allContests.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            {activeContest?.is_registered ? (
              <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/30 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                Registered & Active
              </span>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={isRegistering}
                size="lg"
                className="gap-2 shadow-md bg-[#ffa116] hover:bg-[#ffb43a] text-black font-bold"
              >
                <Trophy className="h-4 w-4" />
                {isRegistering ? 'Registering...' : 'Register for Contest'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Contest Challenges vs Live Leaderboard */}
      <div className="flex items-center gap-2 border-b border-[#383838] pb-2">
        <button
          onClick={() => setActiveTab('problems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'problems'
              ? 'bg-[#ffa116] text-black shadow-xs font-bold'
              : 'text-[#d1d5db] hover:text-white hover:bg-[#262626] border border-[#383838]'
          }`}
        >
          <Code2 className="h-4 w-4" />
          Contest Problems ({activeContest?.challenges.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-[#ffa116] text-black shadow-xs font-bold'
              : 'text-[#d1d5db] hover:text-white hover:bg-[#262626] border border-[#383838]'
          }`}
        >
          <Trophy className="h-4 w-4 text-[#ffa116]" />
          Live Global Leaderboard ({leaderboard.length})
        </button>
      </div>

      {/* Tab Body: Problems Grid */}
      {activeTab === 'problems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeContest?.challenges.map((c, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <div
                key={c.id}
                className="group relative p-5 rounded-2xl border border-[#383838] bg-[#262626] hover:border-[#ffa116] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e1e] group-hover:bg-[#ffa116]/10 text-[#ffffff] group-hover:text-[#ffa116] font-extrabold text-sm transition-colors border border-[#383838]">
                      {letter}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#ffffff] group-hover:text-[#ffa116] transition-colors">
                        {c.title}
                      </h3>
                      <span className="text-[11px] text-[#9ca3af] font-medium">
                        Problem {letter} • {c.points} Points
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      c.difficulty === 'hard'
                        ? 'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/30'
                        : c.difficulty === 'medium'
                        ? 'bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/30'
                        : 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/30'
                    }`}
                  >
                    {c.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#383838]">
                  <span className="text-[11px] text-[#9ca3af]">
                    Max Score: <strong className="text-[#ffa116]">{c.points}</strong>
                  </span>

                  <Link to={`/dashboard/arena?challenge=${c.slug}`}>
                    <Button size="sm" className="h-8 text-xs gap-1.5 font-bold bg-[#ffa116] hover:bg-[#ffb43a] text-black">
                      Solve Problem {letter}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Body: Live Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-2xl border border-[#383838] bg-[#262626] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e1e1e] border-b border-[#383838] text-[#9ca3af] font-medium">
                <tr>
                  <th className="py-3 px-4 font-semibold w-16 text-center">Rank</th>
                  <th className="py-3 px-4 font-semibold">Competitor</th>
                  <th className="py-3 px-4 font-semibold">Total Score</th>
                  <th className="py-3 px-4 font-semibold">Finish / Penalty Time</th>
                  <th className="py-3 px-4 font-semibold text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#383838] text-[#d1d5db]">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    return (
                      <tr key={entry.user_id} className="hover:bg-[#2e2e2e] transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40">
                              🥉
                            </span>
                          ) : (
                            <span className="text-[#9ca3af] font-mono">#{entry.rank}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-[#ffffff]">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-[#ffa116]/20 text-[#ffa116] font-bold flex items-center justify-center text-[10px] border border-[#ffa116]/40">
                              {entry.display_name.slice(0, 1).toUpperCase()}
                            </span>
                            <span>{entry.display_name}</span>
                            {entry.user_id === user?.id && (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#ffa116] text-black">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#ffffff]">
                          <span className="text-[#ffa116]">{entry.score}</span> / 1000
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#9ca3af]">
                          {formatPenalty(entry.penalty_seconds)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              entry.score >= 800
                                ? 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/30'
                                : entry.score >= 400
                                ? 'bg-[#ffa116]/10 text-[#ffa116] border-[#ffa116]/30'
                                : 'bg-[#1e1e1e] text-[#9ca3af] border-[#383838]'
                            }`}
                          >
                            <Award className="h-3 w-3" />
                            {entry.score >= 800 ? 'Grandmaster' : entry.score >= 400 ? 'Expert' : 'Competitor'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9ca3af]">
                      No submissions recorded yet for this contest.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
