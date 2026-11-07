import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
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
  CheckCircle2,
} from 'lucide-react';

export function RegisterPage() {
  const [tab, setTab] = useState<'signup' | 'signin'>('signup');
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

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
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier: identifier.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Incorrect email/user ID or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs group-hover:scale-105 transition-transform">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">DevMind AI</span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          {tab === 'signup' ? 'Create Your Account' : 'Sign In to DevMind'}
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          {tab === 'signup'
            ? 'Sign up in seconds, then easily log in via password and your email or username.'
            : 'Access your interactive assessments and developer workspace.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-md rounded-2xl sm:px-10">
          {/* Top Segmented Tab Switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                tab === 'signup'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                tab === 'signin'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Role selector first so Google signup uses the chosen role */}
          {tab === 'signup' && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                I am joining as:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['candidate', 'creator', 'recruiter'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      role === r
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <GoogleAuthButton
            mode={tab}
            role={role}
            onError={setError}
            onSuccess={() => navigate('/dashboard', { replace: true })}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2.5 text-slate-500 font-semibold">
                {tab === 'signup' ? 'Or register with email' : 'Or sign in with email or user id'}
              </span>
            </div>
          </div>

          {tab === 'signup' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name / Username / User ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Ada Lovelace or ada_dev"
                    required
                    className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="engineer@devmind.ai"
                    required
                    className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 gap-2 font-medium"
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
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email, Username, or User ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="email@example.com or username / user ID"
                    required
                    className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 gap-2 font-medium"
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

          <p className="mt-6 text-center text-xs text-slate-600">
            {tab === 'signup' ? (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="font-semibold text-brand-600 hover:text-brand-700 underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="font-semibold text-brand-600 hover:text-brand-700 underline"
                >
                  Sign Up (Create Account)
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
