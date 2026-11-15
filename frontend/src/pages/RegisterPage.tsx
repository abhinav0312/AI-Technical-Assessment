import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { UserRole } from '@/types/auth';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Trophy,
  Brain,
  Code2,
  Check,
  Flame,
} from 'lucide-react';

export function RegisterPage() {
  const [tab, setTab] = useState<'signup' | 'signin'>('signup');
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  // Dynamic Password Strength Meter
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-neutral-600' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        displayName: displayName.trim(),
        email: identifier.trim().toLowerCase(),
        password,
        role,
      });
      setSuccessMessage('Account created successfully! Preparing your developer workspace...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify your details.');
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
    <div className="min-h-screen bg-[#141414] text-[#eff2f6] flex flex-col font-sans antialiased selection:bg-[#ffa116]/30 selection:text-white">
      <Navbar />

      {/* Split-Screen Main Content */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffa116]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00b8a3]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO VALUE PROP & COMMUNITY PROOF           */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-8 hidden lg:block pr-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa116]/15 border border-[#ffa116]/30 text-xs font-bold text-[#ffa116]">
                <Flame className="h-3.5 w-3.5 fill-[#ffa116]" />
                <span>Next-Generation Engineering Evaluation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Master Algorithms. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffa116] via-[#ffb84d] to-[#00b8a3]">
                  Ace Your Technical Interviews.
                </span>
              </h1>

              <p className="text-sm text-neutral-300 leading-relaxed max-w-lg">
                Join over 50,000 developers practicing with intelligent automated execution, ThinkTrace cognitive telemetry, and real-world DevSim multi-container workspaces.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#1e1e1e]/80 border border-[#2d2d2d] backdrop-blur-xs">
                <div className="h-9 w-9 rounded-xl bg-[#00b8a3]/15 text-[#00b8a3] flex items-center justify-center shrink-0 mt-0.5">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">3,000+ Algorithmic Challenges</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Sub-millisecond test runner across Python, C++, Java, and TypeScript with isolated sandbox security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#1e1e1e]/80 border border-[#2d2d2d] backdrop-blur-xs">
                <div className="h-9 w-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ThinkTrace AI & CodeTwin SkillGraph</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Personalized 32-vector skill radar mapping your true engineering strengths, trade-offs, and weak spots.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-[#1e1e1e]/80 border border-[#2d2d2d] backdrop-blur-xs">
                <div className="h-9 w-9 rounded-xl bg-[#ffa116]/15 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bi-Weekly Rated Contests & Arcade</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                    Live global competitive rankings plus SpeedCoder Nitro & ByteSnake 2077 coding games.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof Strip */}
            <div className="pt-2 border-t border-[#262626] flex items-center gap-3">
              <div className="flex -space-x-2">
                {['Google', 'Meta', 'Apple', 'Netflix'].map((co) => (
                  <div
                    key={co}
                    className="h-7 w-7 rounded-full bg-[#262626] border border-[#383838] flex items-center justify-center text-[9px] font-extrabold text-neutral-300 font-mono shadow-xs"
                    title={co}
                  >
                    {co[0]}
                  </div>
                ))}
              </div>
              <span className="text-xs text-neutral-400">
                Practiced by engineers who landed offers at top tech giants.
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: MODERN SIGN-UP CARD                        */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="rounded-3xl border border-[#383838] bg-[#1e1e1e] p-6 sm:p-8 shadow-2xl relative">
              {/* Card Header & Switcher */}
              <div className="space-y-4 mb-6">
                <div className="flex rounded-xl bg-[#141414] p-1 border border-[#333333]">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setError(null);
                    }}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      tab === 'signup'
                        ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signin');
                      setError(null);
                    }}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      tab === 'signin'
                        ? 'bg-[#262626] text-[#ffa116] border border-[#ffa116]/30 shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {tab === 'signup' ? 'Start Your Coding Journey' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    {tab === 'signup'
                      ? 'Sign up in seconds. Free forever with unlimited standard challenges.'
                      : 'Enter your credentials to access your developer portal.'}
                  </p>
                </div>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Role Selection for Sign-Up */}
              {tab === 'signup' && (
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-2">
                    I am joining as:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'candidate', label: 'Developer', desc: 'Solve & Practice' },
                      { key: 'creator', label: 'Creator', desc: 'Author Problems' },
                      { key: 'recruiter', label: 'Recruiter', desc: 'Screen Talent' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setRole(item.key as UserRole)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          role === item.key
                            ? 'border-[#ffa116] bg-[#ffa116]/10 text-white shadow-xs'
                            : 'border-[#333333] bg-[#141414] text-neutral-400 hover:border-neutral-500 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[9px] text-neutral-400 mt-0.5 truncate">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* One-Click Google Authentication */}
              <div className="mb-4">
                <GoogleAuthButton
                  mode={tab}
                  role={role}
                  onError={setError}
                  onSuccess={() => navigate('/dashboard', { replace: true })}
                />
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#333333]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-[#1e1e1e] px-3 text-neutral-400">
                    {tab === 'signup' ? 'Or register with email' : 'Or continue with email'}
                  </span>
                </div>
              </div>

              {/* Main Forms */}
              {tab === 'signup' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Full Name / Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Alex Rivera or alex_dev"
                        required
                        className="pl-9 h-10 text-xs bg-[#141414] border-[#383838] text-white placeholder:text-neutral-500 focus:border-[#ffa116] rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="engineer@devmind.ai"
                        required
                        className="pl-9 h-10 text-xs bg-[#141414] border-[#383838] text-white placeholder:text-neutral-500 focus:border-[#ffa116] rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-neutral-300">
                        Password
                      </label>
                      {password && (
                        <span className={`text-[10px] font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="pl-9 pr-9 h-10 text-xs bg-[#141414] border-[#383838] text-white placeholder:text-neutral-500 focus:border-[#ffa116] rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator Bars */}
                    {password && (
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-[#2b2b2b]'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Free Plan Perks Checklist */}
                  <div className="py-2 space-y-1.5 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#00b8a3] shrink-0" />
                      <span>Instant access to 3,000+ algorithm challenges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#00b8a3] shrink-0" />
                      <span>Free bi-weekly ranked contests and Elo leaderboard</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl font-black text-sm bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] text-black shadow-lg shadow-[#ffa116]/20 transition-all hover:scale-[1.01] cursor-pointer gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Email Address or Username
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="engineer@devmind.ai or username"
                        required
                        className="pl-9 h-10 text-xs bg-[#141414] border-[#383838] text-white placeholder:text-neutral-500 focus:border-[#ffa116] rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-neutral-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-[11px] text-[#ffa116] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="pl-9 pr-9 h-10 text-xs bg-[#141414] border-[#383838] text-white placeholder:text-neutral-500 focus:border-[#ffa116] rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl font-black text-sm bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] text-black shadow-lg shadow-[#ffa116]/20 transition-all hover:scale-[1.01] cursor-pointer gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Bottom Switch Link */}
              <div className="mt-6 pt-4 border-t border-[#333333] text-center text-xs text-neutral-400">
                {tab === 'signup' ? (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="font-bold text-[#ffa116] hover:underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </span>
                ) : (
                  <span>
                    New to DevMind?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signup')}
                      className="font-bold text-[#ffa116] hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#262626] py-4 text-center text-xs text-neutral-500">
        © 2026 DevMind AI. Designed for developers, engineers, and technical evaluators.
      </footer>
    </div>
  );
}

export default RegisterPage;