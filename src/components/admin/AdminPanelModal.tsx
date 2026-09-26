import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Users,
  Building2,
  Activity,
  Server,
  Zap,
  CheckCircle2,
  X,
  CreditCard,
  Mail,
} from 'lucide-react';

export const AdminPanelModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useApp();

  if (!isOpen) return null;

  // Verify role
  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/40 text-center text-slate-100 max-w-sm">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-400 mb-4">
            You do not have administrative privileges to access the Mailora Platform Control Center.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const systemMetrics = [
    { label: 'Active SaaS Tenants', val: '1,420', change: '+12% this week', icon: Building2 },
    { label: 'Total Users Registered', val: '3,892', change: '+84 today', icon: Users },
    { label: 'AI Emails Processed (24h)', val: '184,920', change: '99.98% delivery', icon: Mail },
    { label: 'Platform MRR', val: '$68,400', change: '84% annual plans', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Mailora SuperAdmin Control</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase">
                  Protected System
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Platform-wide telemetry, multi-tenant subscription health, and cluster status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {systemMetrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-semibold">{m.label}</span>
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{m.val}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">{m.change}</div>
                </div>
              );
            })}
          </div>

          {/* System Health */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Service Cluster Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Gemini API Gateway</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99.99%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Google OAuth Service</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Operational
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>Firestore Multi-Region</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 12ms latency
                </span>
              </div>
            </div>
          </div>

          {/* Recent Tenant Audit Log */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Recent System Audit Events</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>[TENANT_CREATE] Workspace "Apex Design Studio" provisioned</span>
                <span className="text-slate-500 text-[10px]">2m ago</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>[GMAIL_OAUTH] Scopes granted for support@apexdesign.com</span>
                <span className="text-slate-500 text-[10px]">6m ago</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>[RAG_INDEX] 14 document chunks embedded for biz_mailora_901</span>
                <span className="text-slate-500 text-[10px]">14m ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Admin View
          </button>
        </div>
      </div>
    </div>
  );
};
