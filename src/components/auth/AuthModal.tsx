import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import { X, Sparkles, CheckCircle2, ShieldCheck, Mail, Calendar, HardDrive, FileSpreadsheet } from 'lucide-react';
import { signInWithGoogle } from '../../services/firebaseAuth';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    loginAsDemoUser,
    setUserProfile,
    setCurrentView,
    addToast,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result?.user) {
        setUserProfile(
          {
            uid: result.user.uid,
            email: result.user.email || 'johirul4856@gmail.com',
            displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Johirul Islam',
            photoURL: result.user.photoURL || undefined,
            businessId: `biz_${result.user.uid}`,
            role: 'owner',
            createdAt: new Date().toISOString(),
          },
          result.accessToken
        );
      }
      addToast({
        type: 'success',
        title: 'Signed in with Google ✓',
        message: 'Welcome to your Mailora AI workspace! All Google Workspace services connected.',
      });
      setIsAuthModalOpen(false);
      setCurrentView('dashboard');
    } catch (err: any) {
      console.warn('Google auth notice:', err);
      // If popup was closed or network interrupted, give clear message or demo fallback
      if (err.message && err.message.includes('closed-by-user')) {
        setError('Sign in popup was closed. Please try again to connect your Google account.');
      } else {
        loginAsDemoUser();
        setIsAuthModalOpen(false);
        setCurrentView('dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0b0f19] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <Logo size="md" className="mb-4" />
          <h2 className="text-2xl font-black text-white tracking-tight">
            {authModalMode === 'signup' ? 'Get Started with Mailora AI' : 'Sign In to Your Workspace'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
            Connect your Google account once to unlock 24/7 autonomous email support, calendar bookings, and Drive file sync.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Permissions & Features Included in First Google Login */}
        <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs text-slate-300">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All-in-One Instant Google Access</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span><strong>Gmail</strong>: 24/7 Autopilot email reading & spam-safe replies</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span><strong>Google Calendar</strong>: Automatic urgent appointment booking</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <span><strong>Google Drive & Docs</strong>: RAG knowledge base & PDF attachments</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span><strong>Google Sheets</strong>: Live interaction logging & activity reports</span>
          </div>
        </div>

        {/* Primary Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold shadow-xl shadow-white/10 hover:shadow-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-slate-200 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          )}
          <span>{isLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          By signing in, you grant Mailora AI permission to manage customer emails, calendar slots, and business knowledge documents on your behalf.
        </p>
      </div>
    </div>
  );
};
