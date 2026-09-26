import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AutomationAction, AutomationTrigger, EmailIntent } from '../../types';
import {
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  X,
  Sliders,
  Mail,
  Shield,
  Layers,
} from 'lucide-react';

export const AutomationsPage: React.FC = () => {
  const { automations, toggleAutomationRule, addAutomationRule } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [conditionIntent, setConditionIntent] = useState<EmailIntent | 'ANY'>('Pricing');
  const [action, setAction] = useState<AutomationAction>('AUTO_REPLY');

  const intents: (EmailIntent | 'ANY')[] = [
    'ANY',
    'Pricing',
    'Sales inquiry',
    'Product question',
    'Support',
    'Complaint',
    'Refund',
    'Booking',
    'Appointment',
    'Partnership',
    'General inquiry',
  ];

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    addAutomationRule({
      name: ruleName,
      trigger: 'EMAIL_RECEIVED',
      conditionIntent,
      action,
      isActive: true,
    });

    setRuleName('');
    setIsAddModalOpen(false);
  };

  const actionLabels: Record<AutomationAction, { label: string; desc: string; color: string }> = {
    AUTO_REPLY: {
      label: 'Generate & Auto-Send Reply',
      desc: 'Formulate response with business knowledge and dispatch immediately.',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    REVIEW_QUEUE: {
      label: 'Hold for Human Approval',
      desc: 'Pause outbound message and place in Attention queue.',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    ESCALATE_HUMAN: {
      label: 'Escalate to Team Member',
      desc: 'Assign high priority flag and alert executive inbox.',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    IGNORE: {
      label: 'Archive / Ignore',
      desc: 'Do not respond or queue.',
      color: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Automation Rules</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {automations.length} Active Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Define declarative triggers and actions to automate incoming email flows based on AI intent analysis.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {automations.map(rule => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
              rule.isActive ? 'border-slate-800 shadow-sm' : 'border-slate-800/40 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                </div>

                {/* Workflow Logic Flowchart */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                    WHEN: <span className="text-sky-400 font-bold">New Email</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

                  <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                    IF: Intent =={' '}
                    <span className="text-indigo-400 font-bold">{rule.conditionIntent}</span>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

                  <div
                    className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${
                      actionLabels[rule.action].color
                    }`}
                  >
                    THEN: {rule.action.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Toggle Active Button */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => toggleAutomationRule(rule.id)}
                  className={`p-1 transition-colors ${
                    rule.isActive ? 'text-indigo-400' : 'text-slate-600'
                  }`}
                  title={rule.isActive ? 'Active' : 'Inactive'}
                >
                  {rule.isActive ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Extensibility Architecture Callout */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Extensibility Architecture</span>
        </div>
        <p>
          Mailora's automation pipeline is designed to interface with Google Calendar, Google Sheets, Slack alerts, and CRM webhooks as your workflows expand.
        </p>
      </div>

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Create Automation Rule</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  placeholder="e.g. Route Refund inquiries to Review Queue"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trigger
                </label>
                <input
                  type="text"
                  disabled
                  value="Incoming Gmail Email Received"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Condition (Detected Intent)
                </label>
                <select
                  value={conditionIntent}
                  onChange={e => setConditionIntent(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {intents.map(i => (
                    <option key={i} value={i}>
                      {i === 'ANY' ? 'ANY (Match All Emails)' : `Intent: ${i}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Action
                </label>
                <select
                  value={action}
                  onChange={e => setAction(e.target.value as AutomationAction)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="AUTO_REPLY">Auto-reply & Send</option>
                  <option value="REVIEW_QUEUE">Send to Needs Attention Queue</option>
                  <option value="ESCALATE_HUMAN">Escalate to Senior Team</option>
                  <option value="IGNORE">Ignore / Mark Resolved</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow transition-all"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
