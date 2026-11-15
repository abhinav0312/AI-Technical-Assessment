import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { UserRole } from '@/types/auth';
import {
  Terminal,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export function LoginPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  // Form states
  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleTabChange = (newTab: 'signin' | 'signup') => {
    setTab(newTab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier: identifier.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Incorrect email/user ID or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        displayName: displayName.trim(),
        email: identifier.trim().toLowerCase(),
        password,
        role,
      });
      setSuccessMessage('Account created! Taking you to your dashboard...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoId: string) => {
    setIdentifier(demoId);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#ffffff] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffa116] text-black shadow-xs group-hover:scale-105 transition-transform font-bold">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#ffffff]">DevMind AI</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-[#ffffff]">
          {tab === 'signin' ? 'Sign In to DevMind' : 'Create Your DevMind Account'}
        </h2>
        <p className="mt-1 text-xs text-[#9ca3af]">
          {tab === 'signin'
            ? 'Access your interactive assessments, telemetry reports, and coding arena.'
            : 'Get started in seconds. You can easily log in anytime via email or username/user ID.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#262626] border border-[#383838] py-8 px-6 shadow-xl rounded-2xl sm:px-10 text-[#eff2f6]">
          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="mb-6 flex rounded-xl bg-[#1e1e1e] p-1 border border-[#383838]">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                tab === 'signin'
                  ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs font-bold'
                  : 'text-[#9ca3af] hover:text-[#ffffff]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                tab === 'signup'
                  ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs font-bold'
                  : 'text-[#9ca3af] hover:text-[#ffffff]'
              }`}
            >
              Sign Up (Create Account)
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/30 p-3.5 text-xs text-[#ff375f] flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#ff375f]" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl bg-[#00b8a3]/10 border border-[#00b8a3]/30 p-3.5 text-xs text-[#00b8a3] flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#00b8a3]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Single Sign-On Button */}
          <GoogleAuthButton
            mode={tab}
            role={role}
            onError={setError}
            onSuccess={() => navigate(from, { replace: true })}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#383838]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#262626] px-2.5 text-[#9ca3af] font-semibold">
                {tab === 'signin' ? 'Or sign in with email or user id' : 'Or register with email'}
              </span>
            </div>
          </div>

          {/* SIGN IN FORM */}
          {tab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                  Email, Username, or User ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="engineer@company.com or username / user ID"
                    required
                    className="pl-9 text-xs bg-[#1e1e1e] border-[#383838] text-[#ffffff] placeholder:text-[#9ca3af] focus:border-[#ffa116]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#cbd5e1]">
                    Password
                  </label>
                  <a href="#forgot" className="text-[11px] text-[#ffa116] hover:text-[#ffb43a] font-medium">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-9 text-xs bg-[#1e1e1e] border-[#383838] text-[#ffffff] placeholder:text-[#9ca3af] focus:border-[#ffa116]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 gap-2 font-bold bg-[#ffa116] hover:bg-[#ffb43a] text-black shadow-xs"
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
          )}

          {/* SIGN UP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                  Full Name / Username / User ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Mercer or alex_dev"
                    required
                    className="pl-9 text-xs bg-[#1e1e1e] border-[#383838] text-[#ffffff] placeholder:text-[#9ca3af] focus:border-[#ffa116]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <Input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="engineer@devmind.ai"
                    required
                    className="pl-9 text-xs bg-[#1e1e1e] border-[#383838] text-[#ffffff] placeholder:text-[#9ca3af] focus:border-[#ffa116]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="pl-9 text-xs bg-[#1e1e1e] border-[#383838] text-[#ffffff] placeholder:text-[#9ca3af] focus:border-[#ffa116]"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                  I am joining as:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['candidate', 'creator', 'recruiter'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 px-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        role === r
                          ? 'border-[#ffa116] bg-[#ffa116]/10 text-[#ffa116] font-bold'
                          : 'border-[#383838] bg-[#1e1e1e] text-[#cbd5e1] hover:bg-[#2e2e2e] hover:text-[#ffffff]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 gap-2 font-bold bg-[#ffa116] hover:bg-[#ffb43a] text-black shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account & Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[#383838]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-[#9ca3af] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#ffa116]" />
                Quick Test Accounts:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  fillQuickDemo('candidate@devmind.ai');
                }}
                className="py-1.5 px-2 rounded-lg border border-[#383838] bg-[#1e1e1e] hover:border-[#ffa116] hover:bg-[#2e2e2e] text-[11px] font-medium text-[#d1d5db] transition-colors"
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  fillQuickDemo('creator@devmind.ai');
                }}
                className="py-1.5 px-2 rounded-lg border border-[#383838] bg-[#1e1e1e] hover:border-[#ffa116] hover:bg-[#2e2e2e] text-[11px] font-medium text-[#d1d5db] transition-colors"
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  fillQuickDemo('admin@devmind.ai');
                }}
                className="py-1.5 px-2 rounded-lg border border-[#383838] bg-[#1e1e1e] hover:border-[#ffa116] hover:bg-[#2e2e2e] text-[11px] font-medium text-[#d1d5db] transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#9ca3af]">
            {tab === 'signin' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className="font-semibold text-[#ffa116] hover:text-[#ffb43a] underline"
                >
                  Sign Up (Create Account)
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('signin')}
                  className="font-semibold text-[#ffa116] hover:text-[#ffb43a] underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}
