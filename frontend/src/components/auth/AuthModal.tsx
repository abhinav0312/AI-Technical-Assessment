import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowLeft,
  Loader2,
  Terminal,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'password_reset'>('signup');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  // Keep mode in sync whenever modal opens or mode is switched from navbar
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('form');
      setOtpCode('');
      setDevOtpHint(null);
      setError(null);
      setSuccessMessage(null);
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('devmind_last_email') : null;
      if (savedEmail) {
        setIdentifier(savedEmail);
      }
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [initialMode, isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    setStep('form');
    setOtpCode('');
    setDevOtpHint(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    if (typeof window !== 'undefined' && identifier) {
      localStorage.setItem('devmind_last_email', identifier.trim());
    }

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
    setDevOtpHint(null);

    const emailClean = identifier.trim().toLowerCase();
    if (typeof window !== 'undefined' && emailClean) {
      localStorage.setItem('devmind_last_email', emailClean);
    }

    try {
      const res = await sendOtp({
        email: emailClean,
        purpose: 'signup',
        displayName: displayName.trim() || emailClean.split('@')[0],
        password: password,
        role: role,
      });

      setOtpPurpose('signup');
      if (res.dev_code) {
        setDevOtpHint(res.dev_code);
      }
      setSuccessMessage(`A 6-digit confirmation code has been sent to ${emailClean}.`);
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch verification code. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setDevOtpHint(null);

    const emailClean = identifier.trim().toLowerCase();
    if (typeof window !== 'undefined' && emailClean) {
      localStorage.setItem('devmind_last_email', emailClean);
    }

    try {
      const res = await sendOtp({
        email: emailClean,
        purpose: 'password_reset',
        password: password,
      });

      setOtpPurpose('password_reset');
      if (res.dev_code) {
        setDevOtpHint(res.dev_code);
      }
      setSuccessMessage(`A 6-digit reset code has been sent to ${emailClean}.`);
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset code. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await verifyOtp({
        email: identifier.trim().toLowerCase(),
        code: cleanCode,
        purpose: otpPurpose,
        newPassword: password,
      });

      setSuccessMessage(
        otpPurpose === 'signup'
          ? 'Email confirmed & account created successfully! Redirecting...'
          : 'Identity verified & password updated successfully! Redirecting...'
      );

      setTimeout(() => {
        onClose();
        onSuccess?.();
        navigate('/dashboard');
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired confirmation code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await sendOtp({
        email: identifier.trim().toLowerCase(),
        purpose: otpPurpose,
        displayName: displayName.trim(),
        password: password,
        role: role,
      });

      if (res.dev_code) {
        setDevOtpHint(res.dev_code);
      }
      setSuccessMessage(`A new 6-digit verification code has been dispatched to ${identifier.trim().toLowerCase()}.`);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoIdentifier: string) => {
    setIdentifier(demoIdentifier);
    setPassword('Password123!');
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex min-h-screen items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md my-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-900 max-h-[92vh] overflow-y-auto"
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

        {/* STEP 2: 6-DIGIT EMAIL VERIFICATION (OTP) */}
        {step === 'otp' ? (
          <div>
            <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50/70 p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Confirm Your Email Address</h3>
              <p className="text-xs text-slate-600 mt-1">
                We dispatched a secure 6-digit confirmation code to:
              </p>
              <div className="mt-1 font-mono text-xs font-semibold text-brand-700 bg-white/80 py-1 px-2 rounded-md border border-orange-200 inline-block">
                {identifier.trim().toLowerCase()}
              </div>
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

            {/* Dev hint banner (shown if real SMTP is not yet configured) */}
            {devOtpHint && (
              <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Dev Server Passcode:</span>
                  <span className="font-mono text-sm font-bold text-blue-900 tracking-wider">{devOtpHint}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtpHint)}
                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                >
                  Auto-Fill Code
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                  Enter 6-Digit Confirmation Code
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="text-center font-mono text-xl tracking-[10px] h-12 bg-slate-50 border-slate-300 font-bold text-slate-900 focus:bg-white focus:border-brand-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-1">
                  Valid for 10 minutes. Ensures only you can access your account.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full gap-2 text-xs font-semibold h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Confirm & Complete {otpPurpose === 'signup' ? 'Registration' : 'Password Reset'}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Edit email / Back
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 1: LOGIN / REGISTER / RESET FORM */
          <>
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
                <div className="flex-1">
                  <span>{error}</span>
                  {mode === 'signin' && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => handleModeChange('reset')}
                        className="font-bold underline text-rose-800 hover:text-rose-950"
                      >
                        Forgot your password? Click here to verify via email & reset.
                      </button>
                    </div>
                  )}
                </div>
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
            {mode !== 'reset' && (
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
            )}

            {/* Divider */}
            {mode !== 'reset' && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400">
                  <span className="bg-white px-2">
                    {mode === 'signup' ? 'Or register with verified email' : 'Or continue with email / user id'}
                  </span>
                </div>
              </div>
            )}

            {/* FORM: SIGN UP (WITH EMAIL VERIFICATION) */}
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
                      placeholder="e.g. Abhinav Gangele"
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
                      placeholder="Min 6 characters"
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
                      Sending Confirmation Code...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Send Verification Code to Email
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
                    <button
                      type="button"
                      onClick={() => handleModeChange('reset')}
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                      Forgot password?
                    </button>
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

            {/* FORM: PASSWORD RESET WITH EMAIL OTP CONFIRMATION */}
            {mode === 'reset' && (
              <form onSubmit={handleResetRequest} className="space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-brand-600" /> Secure Email Password Reset
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    We will send a 6-digit confirmation code to your email to verify you own this account before changing the password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
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
                      Sending Confirmation Code...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Reset Code to Email
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] text-slate-500 pt-1">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('signin')}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    Back to Sign In
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
