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
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Platform brand in header */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 hidden sm:inline-block">DevMind AI</span>
            </Link>

            {/* Fast challenge jump / quick search */}
            <div className="relative hidden lg:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Jump to problem or skill..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-colors"
                onClick={() => navigate('/challenges')}
                readOnly
              />
            </div>
          </div>

          {/* Right User info and controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/challenges">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs h-8 text-slate-700">
                Problems
              </Button>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* User profile info */}
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard/profile" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase transition-transform group-hover:scale-105">
                  {user?.displayName?.slice(0, 2) || 'DM'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                    {user?.displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
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
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-64 bg-white border-r border-slate-200 h-full z-10 p-2 shadow-xl">
              <div className="flex items-center justify-between p-3 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">DevMind AI</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
