import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../brand/Logo';
import {
  Mail,
  Sparkles,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { GoogleConnectModal } from '../auth/GoogleConnectModal';
import { GoogleCalendarModal } from '../calendar/GoogleCalendarModal';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    business,
    gmailAccount,
    logout,
    isGoogleConnectModalOpen,
    setIsGoogleConnectModalOpen,
    isCalendarModalOpen,
    setIsCalendarModalOpen,
    autoScanCountdown,
    isAutoResponderActive,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Pristine Modern 3D Top Header */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="hidden sm:block border-l border-slate-800 pl-3">
            <span className="text-[11px] font-bold text-slate-400 block leading-tight">
              Autonomous Gmail AI
            </span>
            <span className="text-[10px] text-slate-400">
              100% Autopilot
            </span>
          </div>
        </div>

        {/* Center Live Engine Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-slate-200">
            Auto-Reply Engine: <strong className="text-emerald-400">ACTIVE</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono text-[11px]">
            Checking Gmail every 10s
          </span>
        </div>

        {/* Right Google Account & Actions */}
        <div className="flex items-center gap-3">
          {/* Connected Google Account Pill */}
          <button
            onClick={() => setIsGoogleConnectModalOpen(true)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all text-xs"
          >
            {/* Google Icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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

            <span className="font-semibold text-slate-200 hidden sm:inline max-w-[150px] truncate">
              {gmailAccount.email}
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          {/* Official Gmail Link */}
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs transition-all flex items-center gap-1.5"
            title="Open official Gmail inbox / sent"
          >
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline text-xs font-semibold">Gmail ↗</span>
          </a>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-semibold"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content View (Only Connected + Knowledge Upload) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>

      {/* Google Connect Modal */}
      {isGoogleConnectModalOpen && (
        <GoogleConnectModal
          isOpen={isGoogleConnectModalOpen}
          onClose={() => setIsGoogleConnectModalOpen(false)}
        />
      )}

      {/* Google Calendar Hub Modal */}
      {isCalendarModalOpen && (
        <GoogleCalendarModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
        />
      )}
    </div>
  );
};
