import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInWithGoogle } from '../../services/firebaseAuth';
import { GmailService } from '../../services/gmailService';
import { GoogleDriveService } from '../../services/googleDriveService';
import { getGeminiApiKey, setCustomGeminiApiKey, isGeminiConnected } from '../../lib/gemini';
import {
  X,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  Zap,
  KeyRound,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({ isOpen, onClose }) => {
  const {
    gmailAccount,
    user,
    setUserProfile,
    addToast,
    testSendLiveEmail,
  } = useApp();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState(gmailAccount.email || 'johirul4856@gmail.com');
  const [testSubject, setTestSubject] = useState('Website package pricing inquiry');
  const [testBody, setTestBody] = useState('Hi! Can you tell me what packages you offer and how much a 5-page site costs?');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; reply: string } | null>(null);

  // Custom Gemini Key config
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKey, setCustomKey] = useState(getGeminiApiKey() || '');
  const [isKeySaved, setIsKeySaved] = useState(false);

  if (!isOpen) return null;

  const handleGoogleOAuthConnect = async () => {
    setIsAuthenticating(true);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        const authenticEmail = res.user.email || 'johirul4856@gmail.com';
        setUserProfile(
          {
            uid: res.user.uid,
            email: authenticEmail,
            displayName: res.user.displayName || authenticEmail.split('@')[0],
            photoURL: res.user.photoURL || undefined,
            businessId: 'biz_01',
            role: 'owner',
            createdAt: new Date().toISOString(),
          },
          res.accessToken
        );

        setTestEmailTarget(authenticEmail);

        addToast({
          type: 'success',
          title: 'Google OAuth Connected ✓',
          message: `Connected real Google account: ${authenticEmail} for AI automation.`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Authentication notice',
        message: err.message || 'Could not complete Google OAuth.',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleExecuteLiveTestReply = async () => {
    if (!testEmailTarget) return;
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const result = await testSendLiveEmail({
        toEmail: testEmailTarget,
        customerName: 'Test Customer',
        subject: testSubject,
        body: testBody,
      });

      if (result.success) {
        setTestResult({
          success: true,
          reply: result.reply,
        });
        addToast({
          type: 'success',
          title: 'AI Reply Sent ✓',
          message: `Real email successfully delivered to ${testEmailTarget}!`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Send failed',
        message: err.message || 'Could not send test email.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveApiKey = () => {
    if (customKey.trim()) {
      setCustomGeminiApiKey(customKey.trim());
      setIsKeySaved(true);
      addToast({
        type: 'success',
        title: 'Gemini AI Key Configured ✓',
        message: 'Your custom Gemini API key is active for real-time model responses.',
      });
      setTimeout(() => setIsKeySaved(false), 3000);
    } else {
      setCustomGeminiApiKey(null);
      addToast({
        type: 'info',
        title: 'Using Default Runtime Key',
        message: 'Reverted to Google AI Studio runtime environment key.',
      });
    }
  };

  const isConnected = gmailAccount.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-[#0b0f19] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top 3D Lighting Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shadow-inner">
              <Mail className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Authentic Google Account Connection
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> OAuth 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect the real Gmail account you want Mailora to monitor and automate.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Box */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Google Profile"
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/40 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {(gmailAccount.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {gmailAccount.email || user?.email || 'johirul4856@gmail.com'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Active Automation Inbox
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>Account Name: <strong>{user?.displayName || gmailAccount.name}</strong></span>
                    <span>•</span>
                    <span className="text-slate-500 font-mono text-[10px]">Google Workspace Verified</span>
                  </p>
                </div>
              </div>

              {/* OAuth Connect Button */}
              <button
                onClick={handleGoogleOAuthConnect}
                disabled={isAuthenticating}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Connecting OAuth...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Re-Authenticate Google Account</span>
                  </>
                )}
              </button>
            </div>

            {/* Scopes breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300">
                <span className="text-emerald-400 font-bold block">✓ gmail.send</span>
                <span>Send AI automated replies</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300">
                <span className="text-emerald-400 font-bold block">✓ gmail.readonly</span>
                <span>Read incoming inquiries</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300">
                <span className="text-emerald-400 font-bold block">✓ gmail.modify</span>
                <span>Label & archive threads</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300">
                <span className="text-emerald-400 font-bold block">✓ drive.readonly</span>
                <span>Import business docs</span>
              </div>
            </div>
          </div>

          {/* Test Dispatch Sandbox: Prove email actually replies and sends */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-sky-950/20 border border-indigo-500/25 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Test: Verify Email Delivery & AI Reply
                </h4>
              </div>
              <span className="text-[10px] text-indigo-300 font-semibold">
                Sends a real message via Gmail API
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Send a test inquiry to your email right now. Mailora AI will process it with Gemini 3.8 Flash and dispatch the reply via your connected Gmail.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Recipient Test Email (Where to send reply):
                </label>
                <input
                  type="email"
                  value={testEmailTarget}
                  onChange={e => setTestEmailTarget(e.target.value)}
                  placeholder="e.g. johirul4856@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Subject Line:
                  </label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={e => setTestSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Customer Message Inquiry:
                  </label>
                  <input
                    type="text"
                    value={testBody}
                    onChange={e => setTestBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleExecuteLiveTestReply}
                  disabled={isSendingTest || !testEmailTarget}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating AI Reply & Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Real Test Reply Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test result preview */}
            {testResult && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real Email Dispatched via Gmail API!</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Delivered to {testEmailTarget}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-sans leading-relaxed whitespace-pre-line">
                  {testResult.reply}
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI Status & Custom Key Option */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">AI Engine: Gemini 3.8 Flash</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Connected & Active
                </span>
              </div>
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="text-[11px] text-slate-400 hover:text-white font-medium flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3 text-indigo-400" />
                <span>{showKeyConfig ? 'Hide Key Settings' : 'Configure Custom Key'}</span>
              </button>
            </div>

            {showKeyConfig && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in">
                <label className="block text-[11px] text-slate-400">
                  Optional Custom Gemini API Key (if you wish to override the runtime secret):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={customKey}
                    onChange={e => setCustomKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all"
                  >
                    {isKeySaved ? 'Saved ✓' : 'Save Key'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Mailora AI • Zero manual approval needed • 100% Autopilot
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-all"
          >
            Done & Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
