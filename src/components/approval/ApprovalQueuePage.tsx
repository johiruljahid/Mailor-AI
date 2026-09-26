import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  EyeOff,
  Edit3,
  Send,
  Database,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';

export const ApprovalQueuePage: React.FC = () => {
  const { threads, messages, approveAndSendEmail, rejectEmail, escalateEmail } = useApp();

  const reviewThreads = threads.filter(t => t.status === 'NEEDS_REVIEW');
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editedReplies, setEditedReplies] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [confirmDialogThreadId, setConfirmDialogThreadId] = useState<string | null>(null);

  const getThreadDraft = (threadId: string): string => {
    if (editedReplies[threadId] !== undefined) {
      return editedReplies[threadId];
    }
    const threadMsgs = messages[threadId] || [];
    return threadMsgs.find(m => m.aiDraft)?.aiDraft || '';
  };

  const handleApproveWithConfirmation = async (threadId: string) => {
    setIsSending(true);
    const replyToSend = getThreadDraft(threadId);
    await approveAndSendEmail(threadId, replyToSend);
    setConfirmDialogThreadId(null);
    setEditingThreadId(null);
    setIsSending(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Human Approval Queue
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {reviewThreads.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Keep humans in control. Review, edit, or approve sensitive customer emails before they are dispatched.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Safety guardrails active</span>
        </div>
      </div>

      {/* Confirmation Modal for Destructive/Outbound Operations */}
      {confirmDialogThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-2">Confirm Outbound Email Dispatch</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to send this email via your connected Gmail account? This will dispatch the response directly to the customer.
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 max-h-36 overflow-y-auto mb-5 italic whitespace-pre-line font-mono">
              {getThreadDraft(confirmDialogThreadId)}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialogThreadId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApproveWithConfirmation(confirmDialogThreadId)}
                disabled={isSending}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Confirm & Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Queue List */}
      {reviewThreads.length === 0 ? (
        <div className="py-20 text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Queue is clear!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            There are no customer emails currently requiring manual review. All inbound messages have either been auto-replied or resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewThreads.map(thread => {
            const threadMsgs = messages[thread.id] || [];
            const lastInbound = [...threadMsgs].reverse().find(m => m.direction === 'INBOUND');
            const isEditing = editingThreadId === thread.id;
            const draftText = getThreadDraft(thread.id);

            return (
              <div
                key={thread.id}
                className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-5"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{thread.customerName}</span>
                      <span className="text-xs text-slate-400">&lt;{thread.customerEmail}&gt;</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {thread.detectedIntent}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">{thread.subject}</h3>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono self-start sm:self-center">
                    Received {thread.lastMessageAt}
                  </span>
                </div>

                {/* Why flagged for review */}
                {thread.aiReviewReason && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Reason for Attention: </span>
                      <span>{thread.aiReviewReason}</span>
                    </div>
                  </div>
                )}

                {/* Original Customer Message */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Customer Message:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line italic">
                    {lastInbound?.body}
                  </p>
                </div>

                {/* AI Suggested Response */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/20 to-slate-950 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>AI Suggested Reply</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingThreadId(isEditing ? null : thread.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Response'}</span>
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={6}
                      value={draftText}
                      onChange={e =>
                        setEditedReplies(prev => ({
                          ...prev,
                          [thread.id]: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                    />
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                      {draftText || 'No suggested draft generated.'}
                    </div>
                  )}

                  {/* Matched Knowledge citations */}
                  {lastInbound?.matchedKnowledgeSummary && lastInbound.matchedKnowledgeSummary.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 pt-1">
                      <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Knowledge used:</span>
                      {lastInbound.matchedKnowledgeSummary.map((k, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Queue Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => rejectEmail(thread.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dismiss</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => escalateEmail(thread.id, 'Manually escalated by reviewer')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Escalate to Human</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmDialogThreadId(thread.id)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve & Send</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
