import { Settings, Shield, Monitor, Key, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-2">
          <Settings className="h-3.5 w-3.5" />
          Workspace Configuration
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Configure interface preferences, code editor defaults, and account credentials.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-brand-600" />
            Account & Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Full Name</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{user?.displayName || 'Developer'}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Email Address</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{user?.email || 'user@devmind.ai'}</p>
            </div>
          </div>
        </div>

        {/* Editor & Workspace Preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="h-4 w-4 text-brand-600" />
            Code Editor Preferences
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Modern Light Engineering Theme</div>
                <div className="text-slate-500 text-[11px]">Calibrated off-white canvas with high contrast code highlighting</div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Monaco Font Ligatures & Auto-complete</div>
                <div className="text-slate-500 text-[11px]">IntelliSense suggestions, parameter hints, and syntax diagnostics</div>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Enabled
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">ThinkTrace AI Auto-Analysis</div>
                <div className="text-slate-500 text-[11px]">Generate telemetry audit on every test run and final submission</div>
              </div>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                Automatic
              </span>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600" />
            Security & Authentication
          </h2>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-900">Argon2id Hash Encryption</div>
              <div className="text-slate-500 text-[11px]">Cryptographic password protection with memory-hard verification</div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs text-slate-700">
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
