import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { User, Mail, Calendar, Code, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [learningGoals, setLearningGoals] = useState('Distributed Systems, Concurrency, Dynamic Programming');
  const [bio, setBio] = useState('Software engineer focusing on low-latency backends and algorithmic architecture.');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (displayName !== user?.displayName) {
        await apiClient('/users/me', {
          method: 'PUT',
          body: JSON.stringify({ display_name: displayName }),
        });
      }

      await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          biography: bio,
          experience_level: experienceLevel,
          learning_goals: learningGoals,
        }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200 text-[#eff2f6]">
      <div className="pb-4 border-b border-[#383838] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ffffff] flex items-center gap-2">
            <User className="h-6 w-6 text-[#ffa116]" />
            Engineer Profile & Credentials
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Personal identity, engineering background, and account privileges.
          </p>
        </div>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Profile Saved Successfully
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-[#383838] bg-[#262626] p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffa116]/15 border border-[#ffa116]/40 text-[#ffa116] text-xl font-extrabold uppercase shadow-xs">
            {displayName.slice(0, 2) || 'DM'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#ffffff]">{displayName || 'Developer'}</h2>
            <p className="text-xs text-[#9ca3af] flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 text-[#9ca3af]" />
              {user?.email || 'user@devmind.ai'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30">
                {user?.role || 'candidate'}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">● Active Verified Account</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-[#383838]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#d1d5db]">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] focus:outline-none focus:ring-1 focus:ring-[#ffa116] focus:border-[#ffa116] shadow-2xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#d1d5db]">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] focus:outline-none focus:ring-1 focus:ring-[#ffa116] focus:border-[#ffa116] shadow-2xs cursor-pointer"
              >
                <option value="Junior">Junior Engineer (0-2 years)</option>
                <option value="Mid">Mid-Level Engineer (2-5 years)</option>
                <option value="Senior">Senior Engineer (5-8 years)</option>
                <option value="Staff">Staff / Principal (8+ years)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#d1d5db]">Technical Bio & Focus</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] focus:outline-none focus:ring-1 focus:ring-[#ffa116] focus:border-[#ffa116] shadow-2xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#d1d5db]">Learning Goals & Target Domains</label>
            <input
              type="text"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#383838] bg-[#1e1e1e] text-xs text-[#ffffff] focus:outline-none focus:ring-1 focus:ring-[#ffa116] focus:border-[#ffa116] shadow-2xs"
              placeholder="e.g. Distributed Consensus, Dynamic Programming, SQL Optimization"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} size="sm" className="gap-1.5 shadow-xs bg-[#ffa116] hover:bg-[#f59e0b] text-black font-bold">
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#383838] text-xs">
          <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#383838] space-y-1">
            <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Account Created</span>
            <div className="font-semibold text-[#ffffff] flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#ffa116]" />
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#383838] space-y-1">
            <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Supported Runtimes</span>
            <div className="font-semibold text-[#ffffff] flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-[#ffa116]" />
              Python, C, C++, Java, TypeScript, JavaScript
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
