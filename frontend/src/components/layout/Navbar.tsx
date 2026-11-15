import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Terminal, Shield, Sparkles, LayoutDashboard, LogOut, Menu, X, Flame } from 'lucide-react';
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
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#333333] bg-[#262626]/95 backdrop-blur-md text-white">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffa116] to-[#ff7a00] text-black font-extrabold shadow-sm group-hover:scale-105 transition-transform">
              <Terminal className="h-5 w-5 text-black font-bold" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">DevMind</span>
                <span className="rounded bg-[#ffa116]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#ffa116] border border-[#ffa116]/40">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide">Developer Assessment</span>
            </div>
          </Link>

          {/* Desktop Navigation Links: Quest, Contest, Interview, Arcade, Premium, About */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link to="/challenges" className="text-neutral-300 hover:text-[#ffa116] transition-colors flex items-center gap-1.5">
              Quest
            </Link>
            <Link to="/contests" className="text-neutral-300 hover:text-[#ffa116] transition-colors flex items-center gap-1.5">
              Contest
            </Link>
            <Link to="/interview" className="text-neutral-300 hover:text-purple-400 transition-colors flex items-center gap-1.5">
              Interview
            </Link>
            <Link to="/arcade" className="text-neutral-300 hover:text-sky-400 transition-colors flex items-center gap-1.5">
              Arcade
            </Link>
            <a href="/#premium" className="text-[#ffa116] hover:text-[#ffb84d] transition-colors font-bold">
              Premium
            </a>
            <a href="/#about" className="text-neutral-300 hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/40 text-[#ffa116] text-xs font-bold" title="Daily streak">
                <Flame className="h-3.5 w-3.5 fill-[#ffa116]" />
                <span>3 Days</span>
              </div>
            )}
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button size="sm" className="gap-2 font-bold bg-[#ffa116] hover:bg-[#ff9000] text-black">
                    <LayoutDashboard className="h-4 w-4 text-black" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2.5 pl-2 border-l border-[#383838]">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-white">{user.displayName}</span>
                    <span className="text-[10px] text-neutral-400 capitalize flex items-center gap-1 justify-end">
                      {user.role === 'admin' && <Shield className="h-3 w-3 text-[#ffa116]" />}
                      {user.role}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="h-8 w-8 text-neutral-400 hover:text-rose-400 hover:bg-[#333333]">
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
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                >
                  Log in
                </button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="gap-1.5 font-bold text-xs bg-[#ffa116] hover:bg-[#ff9000] text-black shadow-xs"
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
            className="md:hidden rounded-lg p-2 text-neutral-400 hover:bg-[#333333] hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#333333] bg-[#262626] px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-4">
            {/* Mobile Navigation Links (Clean 3 Core Options) */}
            <nav className="flex flex-col space-y-3">
              <Link
                to="/challenges"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-white hover:text-[#ffa116] py-1.5 flex items-center justify-between"
              >
                <span>Quest Problems</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/30 font-bold">
                  Problems
                </span>
              </Link>
              <Link
                to="/contests"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-white hover:text-[#ffa116] py-1.5 flex items-center justify-between"
              >
                <span>Contests</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/30 font-bold">
                  Live
                </span>
              </Link>
              <Link
                to="/interview"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-white hover:text-purple-400 py-1.5 flex items-center justify-between"
              >
                <span>Interview AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  AI
                </span>
              </Link>
              <Link
                to="/arcade"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-white hover:text-sky-400 py-1.5 flex items-center justify-between"
              >
                <span>Arcade Games</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  Games
                </span>
              </Link>
              <a
                href="/#premium"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-[#ffa116] hover:text-[#ffb84d] py-1.5 flex items-center justify-between"
              >
                <span>DevMind Premium</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#ffa116]/20 text-[#ffa116] border border-[#ffa116]/30 font-bold">
                  Pro
                </span>
              </a>
              <a
                href="/#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-neutral-300 hover:text-white py-1.5 flex items-center justify-between"
              >
                <span>About DevMind</span>
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
