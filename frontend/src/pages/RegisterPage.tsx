import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleIcon } from '@/components/ui/google-icon';
import { UserRole } from '@/types/auth';
import { Terminal, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Google Modal State for custom or fast Google Account
  const [googleEmail, setGoogleEmail] = useState('alex.developer@gmail.com');
  const [googleName, setGoogleName] = useState('Alex Developer');

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ displayName, email, password, role });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
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
        role,
      });
      setShowGoogleModal(false);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Google signup failed. Please try again.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">DevMind AI</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Create Developer Account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Join the engineering intelligence and process-aware assessment platform.
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

          {/* Role selector first so Google signup uses the chosen role */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              I am joining as:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['candidate', 'creator', 'recruiter'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                    role === r
                      ? 'border-brand-500 bg-brand-500/20 text-brand-200 shadow-sm'
                      : 'border-border/60 bg-surface-darkest text-muted-foreground hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-border/80 bg-surface-darkest hover:bg-surface-dark hover:border-slate-500 text-xs font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 group"
          >
            <GoogleIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-surface-card px-2.5 text-muted-foreground font-semibold">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name / Handle
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ada Lovelace"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@devmind.ai"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-4 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Google OAuth Simulation Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-border/80 bg-surface-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="h-5 w-5" />
                <span className="text-sm font-bold text-white">Sign up with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-dark hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              Authenticate via Google Identity Services for <span className="text-white font-medium">DevMind AI</span>. Role: <span className="capitalize font-semibold text-brand-300">{role}</span>.
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
                    Connecting Google Account...
                  </>
                ) : (
                  <>
                    Continue as {googleName.split(' ')[0] || 'User'}
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
                Quick 1-Click Google Engineer Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
