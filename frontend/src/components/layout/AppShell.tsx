import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Terminal, LogOut, Menu, X, Shield, Search } from 'lucide-react';
import { ThemeToggle } from '@/features/theme/ThemeProvider';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-[#1a1a1a] overflow-hidden text-[#eff2f6]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#333333] bg-[#262626]/95 px-4 sm:px-6 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-neutral-400 hover:bg-[#333333] hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Platform brand in header */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ff7a00] text-black font-extrabold shadow-xs group-hover:scale-105 transition-transform">
                <Terminal className="h-4 w-4 text-black font-bold" />
              </div>
              <span className="font-bold tracking-tight text-white hidden sm:inline-block">DevMind AI</span>
            </Link>

            {/* Fast challenge jump / quick search */}
            <div className="relative hidden lg:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Jump to problem or skill..."
                className="h-8 w-full rounded-lg border border-[#383838] bg-[#1e1e1e] pl-8 pr-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#ffa116] focus:border-[#ffa116] transition-colors"
                onClick={() => navigate('/challenges')}
                readOnly
              />
            </div>
          </div>

          {/* Right User info and controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/challenges">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs h-8 text-neutral-200 border-[#383838] hover:bg-[#333333] hover:text-white">
                Quests
              </Button>
            </Link>

            <div className="h-4 w-px bg-[#333333] hidden sm:block" />

            {/* User profile info */}
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard/profile" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffa116]/20 border border-[#ffa116]/40 text-[#ffa116] text-xs font-bold uppercase transition-transform group-hover:scale-105">
                  {user?.displayName?.slice(0, 2) || 'DM'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white group-hover:text-[#ffa116] transition-colors">
                    {user?.displayName}
                  </span>
                  <span className="text-[10px] text-neutral-400 capitalize flex items-center gap-1">
                    {user?.role === 'admin' && <Shield className="h-3 w-3 text-amber-500" />}
                    {user?.role}
                  </span>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log Out"
                className="h-8 w-8 text-neutral-400 hover:text-rose-400 hover:bg-[#333333]"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#1a1a1a]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-64 flex-col bg-[#262626] border-r border-[#333333] p-4 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
              <span className="font-bold text-white">DevMind Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1 text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex-1">
              <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
