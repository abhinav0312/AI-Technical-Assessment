import React, { useState } from 'react';
import { Lock, X, ChevronRight, UserPlus, ArrowLeft, Loader2, ShieldCheck, Terminal } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { UserRole } from '@/types/auth';

export function GoogleLogoFull({ className = 'h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google">
      <path d="M9.24 10.98v3.25h5.18c-.21 1.37-.8 2.38-1.7 3.01-.89.62-2.11.99-3.48.99-2.76 0-5.02-2.25-5.02-5.01s2.26-5.01 5.02-5.01c1.5 0 2.6.59 3.4 1.36l2.3-2.3C13.75 6.09 11.75 5 9.24 5 4.88 5 1.32 8.56 1.32 12.92s3.56 7.92 7.92 7.92c2.36 0 4.14-.78 5.54-2.23 1.43-1.43 1.88-3.46 1.88-5.11 0-.51-.04-1.02-.12-1.52H9.24z" fill="#4285F4"/>
      <path d="M22.5 8.5c-2.48 0-4.5 1.93-4.5 4.5s2.02 4.5 4.5 4.5 4.5-1.93 4.5-4.5-2.02-4.5-4.5-4.5zm0 7.22c-1.36 0-2.52-1.12-2.52-2.72s1.16-2.72 2.52-2.72 2.52 1.12 2.52 2.72-1.16 2.72-2.52 2.72z" fill="#EA4335"/>
      <path d="M32.5 8.5c-2.48 0-4.5 1.93-4.5 4.5s2.02 4.5 4.5 4.5 4.5-1.93 4.5-4.5-2.02-4.5-4.5-4.5zm0 7.22c-1.36 0-2.52-1.12-2.52-2.72s1.16-2.72 2.52-2.72 2.52 1.12 2.52 2.72-1.16 2.72-2.52 2.72z" fill="#FBBC05"/>
      <path d="M41.87 8.78v.91h-.06c-.46-.55-1.33-1.04-2.44-1.04-2.32 0-4.22 2.03-4.22 4.55 0 2.5 1.9 4.53 4.22 4.53 1.11 0 1.98-.49 2.44-1.06h.06v.67c0 1.73-.93 2.66-2.42 2.66-1.22 0-1.97-.87-2.28-1.61l-1.74.72c.5 1.22 1.84 2.67 4.02 2.67 2.33 0 4.31-1.37 4.31-4.73V8.78h-1.89zm-2.3 7.02c-1.36 0-2.43-1.15-2.43-2.69s1.07-2.69 2.43-2.69 2.38 1.15 2.38 2.71c0 1.54-1.02 2.67-2.38 2.67z" fill="#4285F4"/>
      <path d="M46.7 5.2h1.98v12.5h-1.98z" fill="#34A853"/>
      <path d="M53.4 15.72c-1.02 0-1.74-.46-2.21-1.39l6.09-2.52-.21-.52c-.39-1.04-1.58-2.79-3.99-2.79-2.39 0-4.38 1.88-4.38 4.5 0 2.52 1.96 4.5 4.7 4.5 2.21 0 3.5-1.36 4.03-2.14l-1.64-1.09c-.54.8-1.28 1.45-2.39 1.45zm-.15-5.54c.83 0 1.53.42 1.77 1.02l-4.24 1.76c-.01-1.98 1.53-2.78 2.47-2.78z" fill="#EA4335"/>
    </svg>
  );
}

export function GoogleGIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export interface GoogleProfile {
  name: string;
  email: string;
  sub: string;
  avatarBg: string;
  initials: string;
}

const DEFAULT_GOOGLE_ACCOUNTS: GoogleProfile[] = [
  {
    name: 'Abhinav',
    email: 'abhinavga22@gmail.com',
    sub: 'google-oauth2|1000',
    avatarBg: 'bg-[#1a73e8]',
    initials: 'AG',
  },
  {
    name: 'Alex Mercer',
    email: 'candidate@devmind.ai',
    sub: 'google-oauth2|1001',
    avatarBg: 'bg-[#673ab7]',
    initials: 'AM',
  },
  {
    name: 'Sarah Connor',
    email: 'creator@devmind.ai',
    sub: 'google-oauth2|1003',
    avatarBg: 'bg-[#e37400]',
    initials: 'SC',
  },
  {
    name: 'DevMind Admin',
    email: 'admin@devmind.ai',
    sub: 'google-oauth2|1004',
    avatarBg: 'bg-[#d93025]',
    initials: 'DA',
  },
];

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
  role?: UserRole;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export function GoogleOAuthModal({
  isOpen,
  onClose,
  mode = 'signup',
  role = 'candidate',
  onSuccess,
  onError,
}: GoogleOAuthModalProps) {
  const [view, setView] = useState<'chooser' | 'custom'>('chooser');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeAccountEmail, setActiveAccountEmail] = useState<string | null>(null);

  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSelectAccount = async (profile: { name: string; email: string; sub: string }) => {
    setActiveAccountEmail(profile.email);
    setIsAuthenticating(true);
    try {
      const payload = JSON.stringify({
        name: profile.name,
        email: profile.email,
        sub: profile.sub,
      });
      await loginWithGoogle({ credential: payload, role });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      onError?.(err?.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
      setActiveAccountEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      onError?.('Please enter a valid Google email address.');
      return;
    }

    const emailName = customName.trim() || customEmail.split('@')[0];
    await handleSelectAccount({
      name: emailName,
      email: customEmail.trim().toLowerCase(),
      sub: `google-user-${Date.now()}`,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex justify-center items-center p-3 sm:p-4 animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      {/* Google Pop-up Window Container */}
      <div
        className="relative w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Browser Popup Window Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#f8fafd] px-4 py-2.5 text-xs text-slate-600 select-none">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-slate-200 text-[9px] text-slate-500">
              <Lock className="h-2 w-2 text-emerald-600" />
            </span>
            <span className="font-mono text-[11px] text-slate-500 truncate max-w-[220px]">
              accounts.google.com/oauth/v2/auth
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
            aria-label="Close Google window"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Animated Google Progress Bar when authenticating */}
        {isAuthenticating && (
          <div className="h-1 w-full bg-slate-100 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] animate-pulse rounded-full" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Google Logo Header */}
          <div className="flex flex-col items-center text-center">
            <GoogleLogoFull className="h-6 mb-3" />
            <h1 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight">
              {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </h1>
            
            {/* App Chip */}
            <div className="mt-2.5 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-brand-600 text-white">
                <Terminal className="h-2.5 w-2.5" />
              </div>
              <span>to continue to <strong className="font-semibold text-slate-800">DevMind AI</strong></span>
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 ml-0.5" />
            </div>
          </div>

          {/* VIEW 1: ACCOUNT CHOOSER */}
          {view === 'chooser' && (
            <div className="mt-6">
              <span className="text-[11px] font-medium text-slate-500 block mb-2 px-1">
                Choose an account
              </span>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                {DEFAULT_GOOGLE_ACCOUNTS.map((acc) => {
                  const isThisAccount = activeAccountEmail === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={isAuthenticating}
                      onClick={() => handleSelectAccount(acc)}
                      className="group flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-[#f8f9fa] disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${acc.avatarBg} text-xs font-semibold text-white shadow-xs group-hover:scale-105 transition-transform`}
                        >
                          {acc.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {acc.name}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isThisAccount ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#1a73e8]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Use another account option */}
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={() => setView('custom')}
                  className="flex w-full items-center gap-3.5 p-3.5 text-left hover:bg-[#f8f9fa] transition-colors border-t border-slate-100"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                    <UserPlus className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-slate-700">
                      Use another account
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Sign in with a different Google email
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: CUSTOM GOOGLE ACCOUNT FORM */}
          {view === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="mt-5 space-y-4">
              <button
                type="button"
                onClick={() => setView('chooser')}
                className="flex items-center gap-1.5 text-xs text-[#1a73e8] hover:underline font-medium mb-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to all accounts
              </button>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Google Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password <span className="text-slate-400 text-[10px]">(Google Simulation)</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setView('chooser')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="rounded-full bg-[#1a73e8] hover:bg-[#1557b0] px-6 py-2 text-xs font-medium text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Google Security & Sharing Disclosure */}
          <p className="mt-5 text-[11px] leading-relaxed text-slate-500 text-left">
            To continue, Google will share your name, email address, language preference, and profile picture with <strong className="font-semibold text-slate-700">DevMind AI</strong>. Before using this app, you can review DevMind AI's <a href="#" className="text-[#1a73e8] hover:underline">Privacy Policy</a> and <a href="#" className="text-[#1a73e8] hover:underline">Terms of Service</a>.
          </p>

          {/* Bottom Google Accounts Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="hover:text-slate-700 cursor-pointer">
              English (United States) ▾
            </span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-slate-700">Help</a>
              <a href="#" className="hover:text-slate-700">Privacy</a>
              <a href="#" className="hover:text-slate-700">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
