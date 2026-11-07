import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bug,
  GitFork,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: any;
  badge?: string;
  upcoming?: boolean;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Coding Arena', to: '/challenges', icon: Code2, badge: 'Live' },
    { label: 'BugHunter', to: '/dashboard/bughunter', icon: Bug, badge: 'Debug' },
    { label: 'Skill Progress', to: '/dashboard/skillgraph', icon: GitFork, badge: 'Skills' },
    { label: 'My Submissions', to: '/dashboard/submissions', icon: History },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-30 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Workspace
            </span>
          </div>
        ) : (
          <div className="mx-auto h-2 w-2 rounded-full bg-brand-600" />
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
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
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-blue-100 text-brand-700 px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow-lg group-hover:block z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Role Badge */}
      <div className="p-3 border-t border-slate-200">
        {!collapsed ? (
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-xs font-semibold text-slate-800">DevMind Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Signed in as: <span className="text-brand-600 capitalize font-medium">{user?.role || 'Engineer'}</span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title={`Role: ${user?.role}`}>
            <div className="h-8 w-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 text-xs font-bold uppercase">
              {user?.role?.slice(0, 1) || 'E'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
