import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Bot,
  Mail,
  CheckCircle2,
  Sparkles,
  Save,
  Globe,
  MessageSquare,
  HelpCircle,
  FileText,
  Shield,
  Zap,
} from 'lucide-react';
import { AgentTone, ReplyLanguage } from '../../types';

export const EmailAgentPage: React.FC = () => {
  const { agent, updateAgent, gmailAccount, setIsTestAgentOpen } = useApp();

  const [name, setName] = useState(agent.name);
  const [status, setStatus] = useState(agent.status);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(agent.autoReplyEnabled);
  const [humanApprovalRequired, setHumanApprovalRequired] = useState(agent.humanApprovalRequired);
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>(agent.replyLanguage);
  const [tone, setTone] = useState<AgentTone>(agent.tone);
  const [instructions, setInstructions] = useState(agent.instructions);
  const [emailSignature, setEmailSignature] = useState(agent.emailSignature);
  const [confidenceThreshold, setConfidenceThreshold] = useState(agent.confidenceThreshold);

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    updateAgent({
      name,
      status,
      autoReplyEnabled,
      humanApprovalRequired,
      replyLanguage,
      tone,
      instructions,
      emailSignature,
      confidenceThreshold,
    });
    setHasChanges(false);
  };

  const agentTemplates = [
    {
      label: 'Customer Support Specialist',
      tone: 'Friendly' as AgentTone,
      prompt: `You are the customer support assistant for our business.
Always answer using verified company information from our knowledge base.
Never invent prices, discounts, return dates, or policies not explicitly stated in our documents.
If information is unavailable or requires human intervention, apologize warmly and let the customer know our operations team will follow up.
Ensure all questions are answered politely, accurately, and with clear next steps.`,
    },
    {
      label: 'Inbound Sales & Lead Qualifier',
      tone: 'Professional' as AgentTone,
      prompt: `You are an inbound sales specialist representing our brand.
Qualify prospective client inquiries, share verified package pricing, highlight project deliverables, and guide interested prospects to book a discovery call.
Keep answers enthusiastic, highly professional, and value-focused. Never negotiate custom discounts outside the official price list.`,
    },
    {
      label: 'Appointment & Booking Coordinator',
      tone: 'Concise' as AgentTone,
      prompt: `You are the appointment scheduling assistant.
Your main job is to answer questions about available consultation times, office hours, and share our calendar booking link.
Be concise, clear, and prompt. Confirm meeting time zones and prerequisites clearly.`,
    },
    {
      label: 'Executive FAQ & Information Concierge',
      tone: 'Formal' as AgentTone,
      prompt: `You are the executive knowledge assistant.
Deliver accurate, structured, and formal answers based strictly on company documentation.
Break down complex policies into easy-to-read bullet points. Never provide speculation on unreleased features or confidential company roadmaps.`,
    },
  ];

  const applyTemplate = (t: typeof agentTemplates[0]) => {
    setTone(t.tone);
    setInstructions(t.prompt);
    setHasChanges(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Email Agent</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Define your AI employee's behavior, tone, language, and automated reply permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTestAgentOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Test Agent Sandbox</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Agent Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Identity & Operation Status */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Identity & Status</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Agent Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operational State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('ACTIVE');
                      setHasChanges(true);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      status === 'ACTIVE'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ● ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('PAUSED');
                      setHasChanges(true);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      status === 'PAUSED'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ❚❚ PAUSED
                  </button>
                </div>
              </div>
            </div>

            {/* Connected Gmail pill */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400" />
                <span className="text-slate-400">Connected Inbox:</span>
                <span className="font-semibold text-white">{gmailAccount.email}</span>
              </div>
              <span className="text-emerald-400 font-semibold text-[11px]">Active OAuth ✓</span>
            </div>
          </div>

          {/* Section 2: Autopilot Execution Mode */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Autopilot Execution Mode</span>
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {!humanApprovalRequired ? '100% Autopilot Active' : 'Draft Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: 100% Autopilot */}
              <div
                onClick={() => {
                  setAutoReplyEnabled(true);
                  setHumanApprovalRequired(false);
                  setHasChanges(true);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  autoReplyEnabled && !humanApprovalRequired
                    ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-lg text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    100% Autopilot (Recommended)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Customer emails are automatically answered and dispatched immediately upon receipt using Gemini 3.8 Flash. No approval barrier.
                </p>
              </div>

              {/* Option 2: Draft Review Mode */}
              <div
                onClick={() => {
                  setHumanApprovalRequired(true);
                  setHasChanges(true);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  humanApprovalRequired
                    ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/50 shadow-lg text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    Draft Review Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  AI drafts the response, but waits for a human click before delivering to the customer.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Agent Instructions */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span>Agent Directives & Instructions</span>
              </h2>
              <span className="text-[11px] text-slate-400">System Prompt</span>
            </div>

            {/* Quick Templates Selector */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Load Preset:</span>
              {agentTemplates.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              value={instructions}
              onChange={e => {
                setInstructions(e.target.value);
                setHasChanges(true);
              }}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Right Column: Tone, Language & Signature Preview */}
        <div className="space-y-6">
          {/* Tone & Language Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Voice & Language</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reply Language
              </label>
              <select
                value={replyLanguage}
                onChange={e => {
                  setReplyLanguage(e.target.value as ReplyLanguage);
                  setHasChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Bangla">Bangla (বাংলা)</option>
                <option value="Bangla + English">Bangla + English (Bilingual)</option>
                <option value="Multi-language (Auto-detect)">Multi-language (Auto-detect)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Response Tone
              </label>
              <select
                value={tone}
                onChange={e => {
                  setTone(e.target.value as AgentTone);
                  setHasChanges(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Professional">Professional & Courteous</option>
                <option value="Friendly">Friendly & Approachable</option>
                <option value="Formal">Formal & Exact</option>
                <option value="Concise">Concise & Direct</option>
                <option value="Empathetic">Empathetic & Warm</option>
              </select>
            </div>
          </div>

          {/* Email Signature & Live Preview */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Email Signature</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Outbound Signature
              </label>
              <textarea
                rows={4}
                value={emailSignature}
                onChange={e => {
                  setEmailSignature(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Live Outbound Preview
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 whitespace-pre-line font-normal italic">
                {emailSignature || 'Best regards,\nCustomer Support Team'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
