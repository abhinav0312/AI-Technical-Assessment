import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleIcon } from '@/components/ui/google-icon';
import { Terminal, Lock, Mail, AlertCircle, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const [googleEmail, setGoogleEmail] = useState('alex.developer@gmail.com');
  const [googleName, setGoogleName] = useState('Alex Developer');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async (customEmail?: string, customName?: string) => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle({
        email: customEmail || googleEmail,
        displayName: customName || googleName,
      });
      setShowGoogleModal(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">DevMind AI</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Sign In to DevMind Intelligence
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Access your interactive assessments, telemetry reports, and coding arena.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface-card border border-border/80 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border/80 bg-surface-darkest hover:bg-surface-dark hover:border-slate-500 text-xs font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 group mb-5"
          >
            <GoogleIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-surface-card px-2.5 text-muted-foreground font-semibold">
                Or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <a href="#forgot" className="text-[11px] text-brand-400 hover:text-brand-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-2 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                Quick Test Accounts:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('candidate@devmind.ai')}
                className="py-1.5 px-2 rounded border border-border/60 bg-surface-darkest hover:border-brand-500/50 hover:bg-surface-dark text-[11px] text-slate-300 transition-colors"
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('creator@devmind.ai')}
                className="py-1.5 px-2 rounded border border-border/60 bg-surface-darkest hover:border-brand-500/50 hover:bg-surface-dark text-[11px] text-slate-300 transition-colors"
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin@devmind.ai')}
                className="py-1.5 px-2 rounded border border-border/60 bg-surface-darkest hover:border-brand-500/50 hover:bg-surface-dark text-[11px] text-slate-300 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Google Sign In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-border/80 bg-surface-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="h-5 w-5" />
                <span className="text-sm font-bold text-white">Continue with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-dark hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              Sign in to your <span className="text-white font-medium">DevMind AI</span> workspace using Google Single Sign-On.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Google Account Name
                </label>
                <Input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="text-xs h-9"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Google Email Address
                </label>
                <Input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="text-xs h-9"
                  placeholder="name@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => handleGoogleAuth()}
                disabled={isGoogleSubmitting}
                className="w-full gap-2 text-xs h-9"
              >
                {isGoogleSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Authenticating with Google...
                  </>
                ) : (
                  <>
                    Sign In as {googleName.split(' ')[0] || 'User'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => handleGoogleAuth('developer.google@devmind.ai', 'Google Developer')}
                disabled={isGoogleSubmitting}
                className="w-full py-1.5 px-3 rounded-lg border border-border/60 bg-surface-darkest hover:border-brand-500/40 text-[11px] text-brand-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Quick 1-Click Google Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
