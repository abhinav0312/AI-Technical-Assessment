import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  Users,
  Code2,
  FileCheck2,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/AuthContext';

interface AdminStats {
  total_users: number;
  total_challenges: number;
  total_submissions: number;
  accepted_submissions: number;
  pass_rate: number;
  active_contests: number;
}

interface GeneratedChallenge {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  description: string;
  constraints: string;
  starter_code: Record<string, string>;
  sample_test_cases: { stdin: string; expected_output: string; description: string }[];
  hidden_test_cases: { stdin: string; expected_output: string; description: string }[];
}

export function AdminPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);

  // Problem Generation State
  const [topic, setTopic] = useState('Segment Tree with Range Minimum Queries');
  const [difficulty, setDifficulty] = useState('hard');
  const [category, setCategory] = useState('algorithms');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<GeneratedChallenge | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiClient<AdminStats>('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    }

    loadStats();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedPreview(null);
    setPublishSuccess(null);
    setPublishError(null);

    try {
      const res = await apiClient<GeneratedChallenge>('/admin/generate-challenge', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          difficulty,
          category,
        }),
      });
      setGeneratedPreview(res);
    } catch (err: any) {
      setPublishError(err.message || 'Failed to synthesize challenge.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedPreview || isPublishing) return;
    setIsPublishing(true);
    setPublishError(null);

    try {
      const res = await apiClient<{ message: string; slug: string }>('/admin/publish-challenge', {
        method: 'POST',
        body: JSON.stringify({ challenge_data: generatedPreview }),
      });
      setPublishSuccess(`Challenge published! Live at slug: ${res.slug}`);
      setGeneratedPreview(null);

      // Refresh stats
      const newStats = await apiClient<AdminStats>('/admin/stats');
      setStats(newStats);
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish challenge.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/30 mb-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            ADMINISTRATOR CMS & STUDIO
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ffffff]">
            Platform Intelligence & Content Studio
          </h1>
          <p className="text-xs text-[#cbd5e1] mt-0.5">
            Synthesize new algorithmic problems, monitor sandbox telemetry, and configure active competitions.
          </p>
        </div>

        <Link to="/challenges">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-[#383838] bg-[#1e1e1e] text-[#eff2f6] hover:bg-[#2e2e2e]">
            <Eye className="h-3.5 w-3.5" />
            View Candidate Arena
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-[#9ca3af] text-xs font-medium">
            <Users className="h-4 w-4 text-[#ffa116]" />
            Registered Users
          </div>
          <div className="text-2xl font-extrabold text-[#ffffff]">{stats?.total_users || 0}</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-[#9ca3af] text-xs font-medium">
            <Code2 className="h-4 w-4 text-[#ffa116]" />
            Problem Bank
          </div>
          <div className="text-2xl font-extrabold text-[#ffffff]">{stats?.total_challenges || 0}</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-[#9ca3af] text-xs font-medium">
            <FileCheck2 className="h-4 w-4 text-[#ffa116]" />
            Total Submissions
          </div>
          <div className="text-2xl font-extrabold text-[#ffffff]">{stats?.total_submissions || 0}</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-[#9ca3af] text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#00b8a3]" />
            Judge Pass Rate
          </div>
          <div className="text-2xl font-extrabold text-[#00b8a3]">{stats?.pass_rate || 0}%</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#383838] bg-[#262626] shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-[#9ca3af] text-xs font-medium">
            <Trophy className="h-4 w-4 text-[#ffa116]" />
            Active Contests
          </div>
          <div className="text-2xl font-extrabold text-[#ffffff]">{stats?.active_contests || 0}</div>
        </div>
      </div>

      {/* AI Problem Studio Card */}
      <div className="rounded-3xl border border-[#383838] bg-[#262626] p-6 shadow-sm space-y-6 text-[#eff2f6]">
        <div className="flex items-center justify-between pb-4 border-b border-[#383838]">
          <div>
            <h2 className="text-base font-bold text-[#ffffff] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#ffa116]" />
              AI Problem Studio: Synthesize & Publish
            </h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Generate fully articulated coding challenges with starter templates (Python, C, C++, Java, JS) and validated test cases.
            </p>
          </div>
        </div>

        {publishSuccess && (
          <div className="p-3.5 rounded-xl bg-[#00b8a3]/10 border border-[#00b8a3]/30 text-[#00b8a3] text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-[#00b8a3] shrink-0" />
            <span>{publishSuccess}</span>
          </div>
        )}

        {publishError && (
          <div className="p-3.5 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/30 text-[#ff375f] text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-[#ff375f] shrink-0" />
            <span>{publishError}</span>
          </div>
        )}

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[#cbd5e1]">Challenge Topic or Algorithm</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Trie Prefix Tree, Disjoint Set Union, Segment Tree"
              className="w-full h-9 px-3 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#ffa116]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#cbd5e1]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] focus:outline-none focus:border-[#ffa116] cursor-pointer"
            >
              <option value="algorithms">Algorithms</option>
              <option value="data_structures">Data Structures</option>
              <option value="concurrency">Concurrency</option>
              <option value="system_design">System Design</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#cbd5e1]">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] focus:outline-none focus:border-[#ffa116] cursor-pointer"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full h-9 text-xs gap-1.5 font-bold shadow-xs bg-[#ffa116] hover:bg-[#ffb43a] text-black"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isGenerating ? 'Synthesizing...' : 'Synthesize Challenge'}
            </Button>
          </div>
        </form>

        {/* Generated Challenge Preview Card */}
        {generatedPreview && (
          <div className="rounded-2xl border border-[#383838] bg-[#1e1e1e] p-5 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#383838]">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/30">
                  {generatedPreview.difficulty} • {generatedPreview.category}
                </span>
                <h3 className="text-base font-bold text-[#ffffff] mt-1">{generatedPreview.title}</h3>
                <span className="text-[11px] text-[#9ca3af] font-mono">slug: {generatedPreview.slug}</span>
              </div>

              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                size="sm"
                className="h-8 gap-1.5 text-xs font-bold bg-[#00b8a3] hover:bg-[#009b88] text-white shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                {isPublishing ? 'Publishing...' : 'Publish to Live Arena'}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">Problem Description</h4>
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#383838] text-xs text-[#eff2f6] whitespace-pre-wrap leading-relaxed font-sans">
                {generatedPreview.description}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1]">Constraints</h4>
              <div className="p-3 rounded-xl bg-[#141414] border border-[#383838] text-xs font-mono text-[#cbd5e1] whitespace-pre-wrap">
                {generatedPreview.constraints}
              </div>
            </div>

            {/* Test Cases Count */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#383838]">
                <span className="text-[#9ca3af] font-semibold uppercase text-[10px]">Sample Tests</span>
                <p className="text-sm font-bold text-[#ffffff] mt-0.5">
                  {generatedPreview.sample_test_cases.length} Public Test Cases
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-[#383838]">
                <span className="text-[#9ca3af] font-semibold uppercase text-[10px]">Hidden Tests</span>
                <p className="text-sm font-bold text-[#ffffff] mt-0.5">
                  {generatedPreview.hidden_test_cases.length} Sandbox Edge Cases
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
