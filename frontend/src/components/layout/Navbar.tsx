import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Terminal, Shield, Sparkles, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-surface-darkest/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">DevMind</span>
              <span className="rounded bg-brand-500/20 px-1 py-0.2 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Engineering Intel</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link to="/features" className="text-muted-foreground hover:text-white transition-colors">
            Capabilities
          </Link>
          <Link to="/challenges" className="text-muted-foreground hover:text-white transition-colors">
            Challenges
          </Link>
          <a href="/#pillars" className="text-muted-foreground hover:text-white transition-colors">
            Pillars
          </a>
          <a href="/#workflow" className="text-muted-foreground hover:text-white transition-colors">
            Architecture
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4 text-brand-400" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.displayName}</span>
                  <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1 justify-end">
                    {user.role === 'admin' && <Shield className="h-3 w-3 text-amber-400" />}
                    {user.role}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" className="h-8 w-8 text-muted-foreground hover:text-rose-400">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="glow" size="sm" className="gap-1.5 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-surface-dark hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/80 bg-surface-darker/95 px-4 pt-3 pb-6 backdrop-blur-xl animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              Capabilities
            </Link>
            <Link
              to="/challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              Challenges
            </Link>
            <a
              href="/#pillars"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-1.5"
            >
              Pillars
            </a>
            <div className="pt-4 border-t border-border/50 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <LayoutDashboard className="h-4 w-4" />
                      Open Dashboard
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-rose-400 gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="glow" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
