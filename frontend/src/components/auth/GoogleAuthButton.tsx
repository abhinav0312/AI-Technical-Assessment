import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { UserRole } from '@/types/auth';
import { GoogleOAuthModal, GoogleGIcon } from './GoogleOAuthModal';

export { GoogleGIcon as GoogleIcon } from './GoogleOAuthModal';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
  role?: UserRole;
  onError?: (message: string) => void;
  onSuccess?: () => void;
}

export function GoogleAuthButton({
  mode = 'signin',
  role = 'candidate',
  onError,
  onSuccess,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [gsiActive, setGsiActive] = useState(false);

  const { loginWithGoogle } = useAuth();
  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isRealClientId =
    Boolean(rawClientId) &&
    !rawClientId.includes('your-google-oauth-web-client-id') &&
    rawClientId.endsWith('.apps.googleusercontent.com');

  useEffect(() => {
    if (!isRealClientId) {
      setGsiActive(false);
      return;
    }

    const initGsi = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: rawClientId,
          callback: async ({ credential }: { credential: string }) => {
            setIsWorking(true);
            try {
              await loginWithGoogle({ credential, role });
              onSuccess?.();
            } catch (err: any) {
              onError?.(err?.message || 'Google authentication failed.');
            } finally {
              setIsWorking(false);
            }
          },
        });
        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: 380,
        });
        setGsiActive(true);
      } catch (err) {
        console.warn('GSI render error, using customized button fallback:', err);
        setGsiActive(false);
      }
    };

    let script = document.getElementById('google-identity-services') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.onload = initGsi;
    if (window.google) initGsi();

    return () => {
      if (script) script.onload = null;
    };
  }, [isRealClientId, rawClientId, mode, role, loginWithGoogle, onError, onSuccess]);

  const buttonText =
    mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <>
      <div className="w-full">
        {/* If real GSI rendered successfully, display the GSI container */}
        {gsiActive && (
          <div className="relative flex justify-center w-full">
            <div ref={containerRef} className="w-full [&>div]:mx-auto" />
            {isWorking && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/90 text-xs font-semibold text-slate-800">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-600" />
                Signing in with Google...
              </div>
            )}
          </div>
        )}

        {/* Professional Google Sign-In Button */}
        {!gsiActive && (
          <button
            type="button"
            disabled={isWorking}
            onClick={() => {
              if (isRealClientId && window.google?.accounts?.id) {
                try {
                  window.google.accounts.id.prompt();
                  return;
                } catch {
                  // Fall through to modal
                }
              }
              setShowGoogleModal(true);
            }}
            className="group relative flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:scale-[0.99] disabled:opacity-70"
          >
            {isWorking ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            ) : (
              <GoogleGIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            <span>{isWorking ? 'Connecting to Google...' : buttonText}</span>
          </button>
        )}
      </div>

      {/* Google OAuth Modal Dialog */}
      <GoogleOAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        mode={mode}
        role={role}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  );
}
