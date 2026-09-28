import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { runAgentTestSimulation } from '../../lib/gemini';
import { retrieveRelevantKnowledge } from '../../lib/knowledgeRetrieval';
import { TestAgentAnalysis } from '../../types';
import {
  X,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  ArrowRight,
  Send,
  RefreshCw,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const TestAgentModal: React.FC = () => {
  const {
    isTestAgentOpen,
    setIsTestAgentOpen,
    agent,
    business,
    knowledge,
    setCurrentView,
    testSendLiveEmail,
    gmailAccount,
    addToast,
  } = useApp();

  const [subject, setSubject] = useState('Website development package price inquiry');
  const [body, setBody] = useState(
    'Hi! I would like to know your website development package price and turnaround time for a clean 5-page responsive site.'
  );
  const [recipientEmail, setRecipientEmail] = useState(gmailAccount.email || 'johirul4856@gmail.com');
  const [isRunning, setIsRunning] = useState(false);
  const [isSendingLive, setIsSendingLive] = useState(false);
  const [result, setResult] = useState<TestAgentAnalysis | null>(null);
  const [liveSendConfirmed, setLiveSendConfirmed] = useState(false);

  if (!isTestAgentOpen) return null;

  const testPresets = [
    {
      label: 'Pricing inquiry',
      subject: 'Website development package price inquiry',
      body: 'Hi, I want to know your website development package price and how fast you can build a 5-page site?',
    },
    {
      label: 'Refund request',
      subject: 'Question regarding 14-day refund guarantee',
      body: 'Hello team, Does your 14-day money back guarantee apply to the Starter web package as well?',
    },
    {
      label: 'Booking consultation',
      subject: 'Schedule discovery call this Thursday',
      body: 'We loved your recent case study and want to book a 30-minute discovery call this Thursday around 3 PM EST.',
    },
    {
      label: 'Customer support',
      subject: 'Urgent assistance with staging link',
      body: 'Hi support, we are checking our project milestone and need assistance viewing the newest design mockup.',
    },
  ];

  const handleRunTest = async (testSub = subject, testBody = body) => {
    setIsRunning(true);
    setResult(null);
    setLiveSendConfirmed(false);

    try {
      const retrieved = retrieveRelevantKnowledge(`${testSub} ${testBody}`, knowledge, 3);
      const simulation = await runAgentTestSimulation(testSub, testBody, agent, retrieved, business.name);
      setResult(simulation);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Simulation error',
        message: err.message || 'Could not run AI agent simulation.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDispatchLiveEmail = async () => {
    if (!recipientEmail) return;
    setIsSendingLive(true);
    try {
      await testSendLiveEmail({
        toEmail: recipientEmail,
        customerName: 'Test Inquirer',
        subject: subject,
        body: body,
      });

      setLiveSendConfirmed(true);
      addToast({
        type: 'success',
        title: 'Real Email Dispatched ✓',
        message: `Reply sent directly to ${recipientEmail} via connected Gmail!`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Live send failed',
        message: err.message || 'Could not send live email.',
      });
    } finally {
      setIsSendingLive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 to-[#0b0f19] border border-slate-800 shadow-2xl text-slate-100 overflow-hidden">
        {/* Top 3D Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">AI Agent Sandbox & Live Tester</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Preview how Mailora classifies intents, retrieves knowledge chunks, and delivers automated replies.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTestAgentOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select a Common Customer Question:
            </span>
            <div className="flex flex-wrap gap-2">
              {testPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSubject(preset.subject);
                    setBody(preset.body);
                    handleRunTest(preset.subject, preset.body);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 transition-all shadow-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-3.5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Email Subject"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Send Real Reply To (Optional Test Recipient):
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="e.g. johirul4856@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Email Body
              </label>
              <textarea
                rows={3}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type any inquiry..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400">
                100% Autopilot enabled: Emails reply automatically upon receipt.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRunTest()}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{isRunning ? 'Analyzing...' : 'Preview AI Reply'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDispatchLiveEmail}
                  disabled={isSendingLive || !recipientEmail}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSendingLive ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Real Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Real Reply to My Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Delivery confirmed notification */}
          {liveSendConfirmed && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Real message sent to <strong>{recipientEmail}</strong> via Gmail API! Check your inbox.
              </span>
            </div>
          )}

          {/* Test Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in">
              {/* Triage Metas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Intent</span>
                  <span className="text-xs font-bold text-indigo-400">{result.intent}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Confidence</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Mode</span>
                  <span className="text-xs font-bold text-emerald-400">
                    AUTO_REPLY (Instant)
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">AI Engine</span>
                  <span className="text-xs font-mono text-cyan-300">Gemini 3.8 Flash</span>
                </div>
              </div>

              {/* Retrieved Knowledge Chunks */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Knowledge Grounding ({result.retrievedKnowledge.length} chunks retrieved)</span>
                </span>
                {result.retrievedKnowledge.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    General business concierge synthesis utilized.
                  </p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {result.retrievedKnowledge.map((k, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                          <span>{k.title}</span>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            Relevance: {Math.round(k.similarity * 100)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic leading-relaxed">{k.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Reply */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Automated Response Preview</span>
                </span>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                  {result.suggestedReply}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between">
          <button
            onClick={() => {
              setIsTestAgentOpen(false);
              setCurrentView('agent');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            ← Configure Agent Tone & Signature
          </button>
          <button
            onClick={() => setIsTestAgentOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
