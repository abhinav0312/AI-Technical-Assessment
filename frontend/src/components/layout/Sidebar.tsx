import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  FileCheck2,
  BarChart3,
  Compass,
  History,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Coding Arena', to: '/dashboard/arena', icon: Code2, badge: 'Live' },
    { label: 'Assessments', to: '/dashboard/assessments', icon: FileCheck2 },
    { label: 'Skill Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Learning Path', to: '/dashboard/learning-path', icon: Compass, upcoming: true },
    { label: 'Activity History', to: '/dashboard/activity', icon: History },
    { label: 'Profile', to: '/dashboard/profile', icon: UserCheck },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/60 bg-surface-darkest/95 backdrop-blur-md transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </span>
          </div>
        ) : (
          <div className="mx-auto h-2 w-2 rounded-full bg-brand-500" />
        )}
        <button
          onClick={onToggle}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-dark hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                    : 'text-muted-foreground hover:bg-surface-dark hover:text-slate-200'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                  {item.upcoming && (
                    <span className="text-[10px] text-muted-foreground/60 uppercase">
                      Soon
                    </span>
                  )}
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-surface-card px-2 py-1 text-xs text-white shadow-lg group-hover:block z-50 whitespace-nowrap border border-border">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Role Badge */}
      <div className="p-3 border-t border-border/50">
        {!collapsed ? (
          <div className="rounded-lg bg-surface-darker/70 p-3 border border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-xs font-semibold text-slate-200">DevMind v1 Core</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Role: <span className="text-brand-300 capitalize font-medium">{user?.role || 'Guest'}</span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title={`Role: ${user?.role}`}>
            <div className="h-8 w-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300 text-xs font-bold uppercase">
              {user?.role?.slice(0, 1) || 'U'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
