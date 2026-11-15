import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Trophy,
  ShieldAlert,
  Bug,
  Network,
  BarChart3,
  Gamepad2,
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
  badgeColor?: string;
  upcoming?: boolean;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Quest (Problems)', to: '/challenges', icon: Code2, badge: 'Solve', badgeColor: 'bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40' },
    { label: 'Interview AI', to: '/dashboard/interview', icon: Brain, badge: 'AI', badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40' },
    { label: 'BugHunter', to: '/dashboard/bughunter', icon: Bug, badge: 'Debug', badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40' },
    { label: 'DevSim Systems', to: '/dashboard/devsim', icon: Network, badge: 'Arch', badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' },
    { label: 'DevArcade', to: '/dashboard/arcade', icon: Gamepad2, badge: 'Games', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' },
    { label: 'SkillGraph Radar', to: '/dashboard/skillgraph', icon: BarChart3, badge: 'Radar', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' },
    { label: 'Contests', to: '/dashboard/contests', icon: Trophy, badge: 'Live', badgeColor: 'bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/40' },
    { label: 'My Submissions', to: '/dashboard/submissions', icon: History },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
    ...(user?.role === 'admin' || user?.role === 'creator'
      ? [{ label: 'Admin Studio', to: '/dashboard/admin', icon: ShieldAlert, badge: 'Staff', badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/40' }]
      : []),
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#333333] bg-[#262626] transition-all duration-300 z-30 select-none text-[#eff2f6]',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#333333]">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#ffa116]" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Workspace
            </span>
          </div>
        ) : (
          <div className="mx-auto h-2 w-2 rounded-full bg-[#ffa116]" />
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#333333] hover:text-white transition-colors"
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
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group relative',
                  isActive
                    ? 'bg-[#ffa116]/15 text-[#ffa116] border-l-2 border-[#ffa116] font-bold shadow-xs'
                    : 'text-neutral-300 hover:bg-[#333333]/70 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.2 rounded-full', item.badgeColor || 'bg-[#ffa116]/20 text-[#ffa116]')}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-[#181818] border border-[#383838] px-2.5 py-1 text-xs text-white shadow-xl group-hover:block z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-[#333333] bg-[#222222]">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              DevMind Engine
            </span>
            <span className="font-mono text-neutral-500 text-[10px]">v1.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
}
