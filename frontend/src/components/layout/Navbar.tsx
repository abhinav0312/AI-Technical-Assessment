import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Terminal, Shield, Sparkles, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/features/theme/ThemeProvider';
import { AuthModal } from '@/components/auth/AuthModal';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition-all">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-slate-900 text-base">DevMind</span>
              <span className="rounded bg-brand-50 px-1.5 py-0.2 text-[10px] font-semibold text-brand-700 border border-brand-200">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Developer Assessment</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link to="/challenges" className="text-slate-600 hover:text-brand-600 transition-colors">
            Coding Arena
          </Link>
          <Link to="/bughunter" className="text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-1.5">
            BugHunter
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
              Debug
            </span>
          </Link>
          <Link to="/dashboard/skillgraph" className="text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-1.5">
            SkillGraph
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-brand-700 font-medium border border-brand-200">
              Skills
            </span>
          </Link>
          <a href="/#workflow" className="text-slate-600 hover:text-brand-600 transition-colors">
            How It Works
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4 text-brand-600" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800">{user.displayName}</span>
                  <span className="text-[10px] text-slate-500 capitalize flex items-center gap-1 justify-end">
                    {user.role === 'admin' && <Shield className="h-3 w-3 text-amber-500" />}
                    {user.role}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signin');
                  setAuthModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Log in
              </button>
              <Button
                size="sm"
                onClick={() => {
                  setAuthModalMode('signup');
                  setAuthModalOpen(true);
                }}
                className="gap-1.5 font-semibold text-xs shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-brand-600 py-1.5"
            >
              Coding Arena
            </Link>
            <Link
              to="/bughunter"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-brand-600 py-1.5 flex items-center justify-between"
            >
              <span>BugHunter</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                Debug
              </span>
            </Link>
            <Link
              to="/dashboard/skillgraph"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-brand-600 py-1.5 flex items-center justify-between"
            >
              <span>SkillGraph</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-brand-700 border border-brand-200 font-medium">
                Skills
              </span>
            </Link>
            <a
              href="/#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-brand-600 py-1.5"
            >
              How It Works
            </a>
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <LayoutDashboard className="h-4 w-4" />
                      Open Dashboard
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-rose-600 hover:bg-rose-50 gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalMode('signin');
                      setAuthModalOpen(true);
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalMode('signup');
                      setAuthModalOpen(true);
                    }}
                  >
                    Sign Up (Create Account)
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Floating Sign Up / Sign In Window Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
}
