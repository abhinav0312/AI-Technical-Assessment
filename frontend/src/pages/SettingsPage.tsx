import { Settings, Shield, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="pb-4 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-brand-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure interface options, editor keybindings, and notification channels.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border/70 bg-surface-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Moon className="h-4 w-4 text-brand-400" />
            Editor & Workspace
          </h2>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-200">Dark Engineering Theme</div>
              <div className="text-muted-foreground text-[11px]">High contrast dark theme optimized for code legibility</div>
            </div>
            <span className="text-xs font-semibold text-emerald-400">Enabled</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-surface-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-400" />
            Security & Authentication
          </h2>
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-200">Password Security</div>
              <div className="text-muted-foreground text-[11px]">Argon2id cryptographic hashing with automatic salt rotation</div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs">Update</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
