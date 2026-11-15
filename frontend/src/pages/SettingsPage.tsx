import { Settings, Shield, Monitor, Key, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200 text-[#eff2f6]">
      <div className="pb-4 border-b border-[#383838]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] text-xs font-bold mb-2">
          <Settings className="h-3.5 w-3.5" />
          Workspace Configuration
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#ffffff] flex items-center gap-2">
          Settings & Preferences
        </h1>
        <p className="text-xs text-[#9ca3af] mt-1">
          Configure interface preferences, code editor defaults, and account credentials.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[#383838] bg-[#262626] p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-[#ffffff] flex items-center gap-2">
            <Monitor className="h-4 w-4 text-[#ffa116]" />
            Account & Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3.5 rounded-xl border border-[#383838] bg-[#1e1e1e]">
              <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Full Name</span>
              <p className="text-sm font-bold text-[#ffffff] mt-0.5">{user?.displayName || 'Developer'}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#383838] bg-[#1e1e1e]">
              <span className="text-[10px] text-[#9ca3af] font-semibold uppercase">Email Address</span>
              <p className="text-sm font-bold text-[#ffffff] mt-0.5">{user?.email || 'user@devmind.ai'}</p>
            </div>
          </div>
        </div>

        {/* Editor & Workspace Preferences */}
        <div className="rounded-2xl border border-[#383838] bg-[#262626] p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-[#ffffff] flex items-center gap-2">
            <Key className="h-4 w-4 text-[#ffa116]" />
            Code Editor Preferences
          </h2>
          <div className="divide-y divide-[#333333] text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#ffffff]">LeetCode High-Contrast Dark Theme</div>
                <div className="text-[#9ca3af] text-[11px]">Calibrated deep canvas (#1a1a1a) with crisp Monaco syntax highlighting</div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Active
              </span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#ffffff]">Monaco Font Ligatures & Auto-complete</div>
                <div className="text-[#9ca3af] text-[11px]">IntelliSense suggestions, parameter hints, and syntax diagnostics</div>
              </div>
              <span className="text-xs font-semibold text-[#ffffff] bg-[#333333] px-2.5 py-0.5 rounded-full">
                Enabled
              </span>
            </div>
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#ffffff]">ThinkTrace AI Auto-Analysis</div>
                <div className="text-[#9ca3af] text-[11px]">Generate telemetry audit on every test run and final submission</div>
              </div>
              <span className="text-xs font-bold text-[#ffa116] bg-[#ffa116]/15 px-2.5 py-0.5 rounded-full border border-[#ffa116]/30">
                Automatic
              </span>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="rounded-2xl border border-[#383838] bg-[#262626] p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-[#ffffff] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#ffa116]" />
            Security & Authentication
          </h2>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-[#ffffff]">Argon2id Hash Encryption</div>
              <div className="text-[#9ca3af] text-[11px]">Cryptographic password protection with memory-hard verification</div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs text-[#ffffff] border-[#383838] hover:bg-[#333333] hover:text-[#ffa116]">
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
