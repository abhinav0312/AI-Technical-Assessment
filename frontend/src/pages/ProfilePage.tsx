import { useAuth } from '@/features/auth/AuthContext';
import { User, Mail, Calendar, Code } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="pb-4 border-b border-border/50">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="h-6 w-6 text-brand-400" />
          Engineer Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Personal identity, engineering background, and account privileges.
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-surface-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xl font-bold uppercase">
            {user?.displayName?.slice(0, 2) || 'DM'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.displayName || 'Developer'}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user?.email || 'user@devmind.ai'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {user?.role}
              </span>
              <span className="text-[11px] text-emerald-400">● Active Status</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/40 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground">Account Created</span>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-400" />
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'October 2026'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground">Preferred Runtime</span>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-brand-400" />
              Python 3.12, TypeScript 5.6
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
