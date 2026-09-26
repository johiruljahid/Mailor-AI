import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThreadStatus } from '../../types';
import {
  Mail,
  Bot,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Send,
  Database,
  ChevronLeft,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const EmailActivityPage: React.FC = () => {
  const {
    threads,
    messages,
    selectedThreadId,
    setSelectedThreadId,
    approveAndSendEmail,
    gmailAccount,
    agent,
    business,
    syncGmailInbox,
    isSyncingGmail,
    simulateIncomingEmail,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>('ALL');
  const [followupText, setFollowupText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredThreads = threads.filter(t => {
    const matchesIntent = selectedIntentFilter === 'ALL' || t.detectedIntent === selectedIntentFilter;
    const matchesSearch =
      !search.trim() ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.detectedIntent.toLowerCase().includes(search.toLowerCase());
    return matchesIntent && matchesSearch;
  });

  const selectedThread = threads.find(t => t.id === selectedThreadId) || (filteredThreads.length > 0 ? filteredThreads[0] : null);
  const activeMessages = selectedThread ? messages[selectedThread.id] || [] : [];

  const handleSendFollowup = async () => {
    if (!selectedThread || !followupText.trim()) return;
    setIsSending(true);
    await approveAndSendEmail(selectedThread.id, followupText);
    setFollowupText('');
    setIsSending(false);
  };

  const intentsList = [
    'ALL',
    'Pricing',
    'Sales inquiry',
    'Support',
    'Refund',
    'Product question',
    'Booking',
    'General inquiry',
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Auto-Replies & Customer Inbox
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Autopilot
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Customer inquiries arriving at <strong className="text-slate-300 font-mono">{gmailAccount.email}</strong> are answered and logged here in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => syncGmailInbox()}
            disabled={isSyncingGmail}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncingGmail ? 'animate-spin' : ''}`} />
            <span>{isSyncingGmail ? 'Scanning...' : 'Sync Gmail'}</span>
          </button>

          <button
            onClick={() => simulateIncomingEmail()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Inbound Email</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer email, sender name, or subject..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {intentsList.map(it => (
            <button
              key={it}
              onClick={() => setSelectedIntentFilter(it)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedIntentFilter === it
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {it}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Pane Modern 3D Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Thread List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {filteredThreads.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              <Mail className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No emails match this filter</p>
              <p className="text-slate-500 mt-1">Try another category or simulate a test inquiry.</p>
            </div>
          ) : (
            filteredThreads.map(thread => {
              const isSelected = selectedThread?.id === thread.id;

              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-900 to-[#12182c] border-indigo-500 shadow-xl shadow-indigo-950/40 translate-x-1'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-white truncate">
                      {thread.customerName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {thread.lastMessageAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {thread.detectedIntent}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Auto-Replied
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 truncate mb-1">
                    {thread.subject}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {thread.snippet}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Full Email Conversation Viewer */}
        <div className="lg:col-span-7">
          {selectedThread ? (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
              {/* Thread Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedThread.detectedIntent}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Replied (100% Autopilot)
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white leading-tight">
                    {selectedThread.subject}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    From: <strong className="text-slate-200">{selectedThread.customerName}</strong> &lt;{selectedThread.customerEmail}&gt;
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono block">
                    Thread ID: {selectedThread.id.slice(0, 14)}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Confidence: {Math.round(selectedThread.confidenceScore * 100)}%
                  </span>
                </div>
              </div>

              {/* Conversation Messages */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px] bg-slate-950/30">
                {activeMessages.map(msg => {
                  const isInbound = msg.direction === 'INBOUND';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {isInbound ? msg.senderName : `${agent.name} (AI Employee)`}
                        </span>
                        <span>•</span>
                        <span>{msg.createdAt}</span>
                        {!isInbound && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                            Sent via Gmail
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isInbound
                            ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                            : 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 text-white rounded-tr-sm shadow-lg'
                        }`}
                      >
                        {msg.body}

                        {/* Knowledge Citation Badge if available */}
                        {msg.matchedKnowledgeSummary && msg.matchedKnowledgeSummary.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
                            <Database className="w-3 h-3 text-sky-400 shrink-0" />
                            <span>Grounded with: {msg.matchedKnowledgeSummary.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Manual Follow-up / Direct Reply */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={followupText}
                    onChange={e => setFollowupText(e.target.value)}
                    placeholder="Send an additional manual note or follow-up to this customer..."
                    className="w-full p-3 pr-24 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendFollowup}
                    disabled={isSending || !followupText.trim()}
                    className="absolute right-2.5 bottom-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500">
              <Mail className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Select an Email Thread</h3>
              <p className="text-xs text-slate-400">
                Choose any customer conversation from the list to view incoming message and automated response.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
