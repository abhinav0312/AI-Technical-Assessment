import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { UserRole } from '@/types/auth';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
  Terminal,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Keep mode in sync whenever modal opens or mode is switched from navbar
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier: identifier.trim(), password });
      onClose();
      onSuccess?.();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Incorrect email/user ID or password. Please try again.');
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
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onClose();
        onSuccess?.();
        navigate('/dashboard');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoIdentifier: string) => {
    setIdentifier(demoIdentifier);
    setPassword('Password123!');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex justify-center items-start pt-24 pb-12 sm:pt-28 sm:pb-16 p-4 animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">DevMind AI</h2>
            <p className="text-[11px] text-slate-500">Engineering Intelligence & Assessment Platform</p>
          </div>
        </div>

        {/* Tab Switcher: Sign Up vs Sign In */}
        <div className="mb-4 flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account (Sign Up)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google Single Sign-On Button */}
        <div className="mb-4">
          <GoogleAuthButton
            mode={mode}
            role={role}
            onError={setError}
            onSuccess={() => {
              onClose();
              onSuccess?.();
              navigate('/dashboard');
            }}
          />
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
            <span className="bg-white px-2">
              {mode === 'signup' ? 'Or register with email' : 'Or continue with email / user id'}
            </span>
          </div>
        </div>

        {/* FORM: SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name / Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Mercer or alex_dev"
                  className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="engineer@company.com"
                  className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Joining as:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['candidate', 'creator', 'recruiter'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold capitalize transition-all ${
                      role === r
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
              className="w-full mt-2 gap-2 text-xs font-semibold h-10"
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

            <p className="text-center text-[11px] text-slate-500 pt-1">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="font-semibold text-brand-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* FORM: SIGN IN */}
        {mode === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email, Username, or User ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@example.com or username / user ID"
                  className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 gap-2 text-xs font-semibold h-10"
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

            {/* Quick Demo Accounts */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand-600" /> Quick Fill Demo:
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('candidate@devmind.ai')}
                  className="py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-medium text-slate-700"
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('creator@devmind.ai')}
                  className="py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-medium text-slate-700"
                >
                  Creator
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin@devmind.ai')}
                  className="py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-medium text-slate-700"
                >
                  Admin
                </button>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-500 pt-1">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="font-semibold text-brand-600 hover:underline"
              >
                Create Account
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
