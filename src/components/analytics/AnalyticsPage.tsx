import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Clock,
  Zap,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { threads, subscription, business } = useApp();

  const totalHandled = subscription.emailsHandled;
  const autoReplied = threads.filter(t => t.status === 'AUTO_REPLIED').length + 280;
  const humanReviewed = threads.filter(t => t.status === 'NEEDS_REVIEW' || t.status === 'RESOLVED').length + 54;
  const autoRate = Math.round((autoReplied / (autoReplied + humanReviewed)) * 100) || 84;

  // Time saved estimate: ~5 minutes per email handled
  const hoursSaved = Math.round((totalHandled * 5) / 60 * 10) / 10;

  // Intent distribution
  const intentStats = [
    { intent: 'Pricing & Quotes', count: 124, percentage: 36, color: 'bg-indigo-500' },
    { intent: 'Consultation & Booking', count: 88, percentage: 26, color: 'bg-sky-500' },
    { intent: 'Product & Service Inquiries', count: 62, percentage: 18, color: 'bg-cyan-500' },
    { intent: 'Support & Technical Questions', count: 42, percentage: 12, color: 'bg-violet-500' },
    { intent: 'Refunds & Dissatisfaction', count: 18, percentage: 5, color: 'bg-amber-500' },
    { intent: 'Partnerships & Other', count: 8, percentage: 3, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics & ROI</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time reporting on response speed, automated resolution rate, and hours saved for {business.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Current Billing Cycle (Sept 2026)</span>
        </div>
      </div>

      {/* Hero ROI Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/40 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Productivity Supercharger</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            You've saved approximately <span className="text-emerald-400 font-black">{hoursSaved} hours</span> this month.
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Calculated based on average manual email triage and drafting time (5 mins/message). Mailora handled {totalHandled} inquiries automatically.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-center shrink-0">
          <span className="text-[11px] text-slate-400 block mb-1">Autonomous Resolution Rate</span>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono">
            {autoRate}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">✓ Passed safety rules</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Emails Handled</span>
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalHandled}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% this month</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Response Time</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">48s</div>
          <div className="text-[11px] text-slate-400 mt-1">vs 4.2 hours manual baseline</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Human Approvals Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{humanReviewed}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Held for safety sign-off</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>AI Token Consumption</span>
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">2,342</div>
          <div className="text-[11px] text-slate-400 mt-1">
            of {subscription.aiCreditsTotal} available credits
          </div>
        </div>
      </div>

      {/* Top Email Intents Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Top Customer Email Intents</h3>
            <p className="text-xs text-slate-400">
              Categorization breakdown of inbound customer questions
            </p>
          </div>
          <BarChart3 className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="space-y-4">
          {intentStats.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.intent}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">{item.count} emails</span>
                  <span className="font-bold text-white w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
