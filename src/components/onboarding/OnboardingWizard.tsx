import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_TEMPLATES } from '../../lib/defaultData';
import { runAgentTestSimulation } from '../../lib/gemini';
import { retrieveRelevantKnowledge } from '../../lib/knowledgeRetrieval';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Bot,
  Database,
  Sliders,
  Send,
  Building2,
  Check,
  Zap,
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const {
    setCurrentView,
    business,
    agent,
    updateAgent,
    knowledge,
    addKnowledgeItem,
    gmailAccount,
    connectGmail,
    applyBusinessTemplate,
    addToast,
  } = useApp();

  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('agencies');
  const [testEmailSubject, setTestEmailSubject] = useState('Website development package price inquiry');
  const [testEmailBody, setTestEmailBody] = useState('Hi, I want to know your website development package price and how fast you can build a 5-page site?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const [customFaqTitle, setCustomFaqTitle] = useState('Pricing & Retainers');
  const [customFaqContent, setCustomFaqContent] = useState('Our starter packages begin at $1,499. Enterprise custom builds start from $5,500.');

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      updateAgent({ status: 'ACTIVE', autoReplyEnabled: true });
      addToast({
        type: 'success',
        title: '🎉 Mailora AI Activated!',
        message: 'Your AI employee is now actively monitoring your connected Gmail.',
      });
      setCurrentView('dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const runTestSimulation = async () => {
    setIsSimulating(true);
    const retrieved = retrieveRelevantKnowledge(
      `${testEmailSubject} ${testEmailBody}`,
      knowledge,
      3
    );
    const result = await runAgentTestSimulation(
      testEmailSubject,
      testEmailBody,
      agent,
      retrieved
    );
    setSimulationResult(result);
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
            {step}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Mailora Setup Wizard</h1>
            <p className="text-[11px] text-slate-400">Step {step} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx + 1 === step
                  ? 'w-8 bg-indigo-500'
                  : idx + 1 < step
                  ? 'w-4 bg-emerald-500'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-xs text-slate-400 hover:text-white"
        >
          Skip to Dashboard
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-4">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-950">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Meet Your AI Employee for Email
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-8">
              Mailora handles incoming customer emails, looks up answers from your business knowledge, and replies instantly in your authentic voice.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Instant Responses</h4>
                <p className="text-[11px] text-slate-400">Replies sent in seconds, 24/7.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Zero Hallucinations</h4>
                <p className="text-[11px] text-slate-400">Trained only on your verified documents.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">Human in Control</h4>
                <p className="text-[11px] text-slate-400">Sensitive requests hold for approval.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Type */}
        {step === 2 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">What type of business do you run?</h2>
              <p className="text-xs text-slate-400">
                Mailora will auto-generate recommended agent guidelines and starter knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 mb-6">
              {Object.entries(BUSINESS_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedIndustry(key);
                    applyBusinessTemplate(key);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedIndustry === key
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-900/40 text-white'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">{item.name}</span>
                    {selectedIndustry === key && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Connect Gmail */}
        {step === 3 && (
          <div className="text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Gmail Account</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
              Mailora uses official Google OAuth with least-privilege permissions. We only read and send emails authorized by your workflow.
            </p>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto mb-6 text-left">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Gmail Integration</h4>
                  <p className="text-xs text-slate-400">
                    {gmailAccount.status === 'connected' ? gmailAccount.email : 'Not connected yet'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    gmailAccount.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {gmailAccount.status === 'connected' ? 'Connected ✓' : 'Standby'}
                </span>
              </div>

              {gmailAccount.status === 'connected' ? (
                <div className="text-xs text-slate-300 space-y-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>OAuth token verified in memory</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Inbound listener ready</span>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => connectGmail()}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow transition-all"
                >
                  <span>Connect with Google OAuth</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Add Business Knowledge */}
        {step === 4 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Teach Mailora Your Business</h2>
              <p className="text-xs text-slate-400">
                Enter your key services, packages, pricing, or refund policies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Knowledge Title
                </label>
                <input
                  type="text"
                  value={customFaqTitle}
                  onChange={e => setCustomFaqTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Information & Policies
                </label>
                <textarea
                  rows={3}
                  value={customFaqContent}
                  onChange={e => setCustomFaqContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (customFaqTitle && customFaqContent) {
                    addKnowledgeItem({
                      title: customFaqTitle,
                      category: 'Pricing',
                      content: customFaqContent,
                      status: 'READY',
                      isEnabled: true,
                    });
                  }
                }}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
              >
                <span>Save to Knowledge Base</span>
              </button>
            </div>

            <div className="text-xs text-slate-400">
              <span className="font-semibold text-white">{knowledge.length} items</span> currently in your knowledge base.
            </div>
          </div>
        )}

        {/* Step 5: Configure AI Agent */}
        {step === 5 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Configure Your AI Employee</h2>
              <p className="text-xs text-slate-400">
                Personalize tone, reply language, and company email signature.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={e => updateAgent({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tone of Voice
                  </label>
                  <select
                    value={agent.tone}
                    onChange={e => updateAgent({ tone: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Friendly">Friendly & Welcoming</option>
                    <option value="Professional">Professional & Courteous</option>
                    <option value="Formal">Formal & Exact</option>
                    <option value="Concise">Concise & Direct</option>
                    <option value="Empathetic">Empathetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Signature
                </label>
                <textarea
                  rows={2}
                  value={agent.emailSignature}
                  onChange={e => updateAgent({ emailSignature: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Test AI Reply */}
        {step === 6 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Test Your Agent in Real-Time</h2>
              <p className="text-xs text-slate-400">
                Simulate an incoming email to see intent classification, retrieved knowledge, and the drafted reply.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Test Email Message
                </label>
                <textarea
                  rows={2}
                  value={testEmailBody}
                  onChange={e => setTestEmailBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={runTestSimulation}
                disabled={isSimulating}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>{isSimulating ? 'Analyzing...' : 'Run Simulation'}</span>
              </button>
            </div>

            {simulationResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300">
                    Intent: {simulationResult.intent} ({Math.round(simulationResult.confidence * 100)}% confidence)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Decision: <strong className="text-emerald-400">{simulationResult.decision}</strong>
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {simulationResult.suggestedReply}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Activate Agent */}
        {step === 7 && (
          <div className="text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-emerald-950">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Your AI employee is ready.
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-8">
              Mailora AI is now primed with your business guidelines and ready to start assisting with incoming customer messages.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-300 max-w-sm mx-auto mb-8 space-y-2">
              <div className="flex items-center justify-between">
                <span>Agent Status:</span>
                <span className="font-bold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gmail Inbox:</span>
                <span className="font-bold text-white">{gmailAccount.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Knowledge Base:</span>
                <span className="font-bold text-white">{knowledge.length} documents indexed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pt-6 border-t border-slate-800/80">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <span>{step === totalSteps ? 'Activate Mailora' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
