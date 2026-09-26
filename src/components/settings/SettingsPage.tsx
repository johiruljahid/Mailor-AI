import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GmailService } from '../../services/gmailService';
import { GoogleDriveService } from '../../services/googleDriveService';
import {
  User,
  Building2,
  Mail,
  Sliders,
  Database,
  Bell,
  Shield,
  CreditCard,
  AlertOctagon,
  CheckCircle2,
  Lock,
  ExternalLink,
  Save,
  HardDrive,
  RefreshCw,
  Send,
  UploadCloud,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    user,
    business,
    knowledge,
    gmailAccount,
    subscription,
    connectGmail,
    disconnectGmail,
    syncGmailInbox,
    isSyncingGmail,
    setIsDriveModalOpen,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'business' | 'workspace' | 'billing' | 'notifications' | 'security' | 'danger'
  >('workspace');

  // Business state
  const [bizName, setBizName] = useState(business.name);
  const [industry, setIndustry] = useState(business.industry);
  const [website, setWebsite] = useState(business.website || '');
  const [timezone, setTimezone] = useState(business.timezone);

  // Profile state
  const [userName, setUserName] = useState(user?.displayName || 'Johirul Islam');
  const [userEmail] = useState(user?.email || 'johirul4856@gmail.com');

  // Test states
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [isExportingDrive, setIsExportingDrive] = useState(false);

  const handleSaveBusiness = () => {
    addToast({
      type: 'success',
      title: 'Business settings saved',
      message: 'Workspace metadata updated.',
    });
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      await GmailService.sendEmail({
        to: gmailAccount.email,
        subject: `[Mailora AI] Test Connection Verification - ${new Date().toLocaleTimeString()}`,
        body: `Hello,\n\nThis is a verification email from Mailora AI confirming that your Gmail connection and OAuth scopes (gmail.send, gmail.readonly) are working properly.\n\nBest regards,\nMailora AI Engine`,
      });
      addToast({
        type: 'success',
        title: 'Test Email Sent ✓',
        message: `Verification message dispatched via Gmail API to ${gmailAccount.email}`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Send Failed',
        message: err.message || 'Could not send test email via Gmail.',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleExportDriveBackup = async () => {
    setIsExportingDrive(true);
    try {
      const backupText = knowledge
        .map(
          k =>
            `DOCUMENT: ${k.title}\nCATEGORY: ${k.category}\nSOURCE: ${k.sourceFileName || 'Direct text'}\n\n${k.content}\n\n----------------------------------------\n`
        )
        .join('\n');

      const fileName = `Mailora_Knowledge_Export_${new Date().toISOString().slice(0, 10)}.txt`;
      await GoogleDriveService.exportBackupToDrive(fileName, backupText, 'text/plain');

      addToast({
        type: 'success',
        title: 'Backed up to Google Drive ✓',
        message: `Successfully uploaded "${fileName}" to your Google Drive.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Drive Export Failed',
        message: err.message || 'Could not export to Google Drive.',
      });
    } finally {
      setIsExportingDrive(false);
    }
  };

  const tabs = [
    { id: 'workspace', label: 'Google Workspace & Drive', icon: Mail },
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'profile', label: 'My Account', icon: User },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Firebase', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertOctagon },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your Google Workspace (Gmail & Drive), Firebase database, and business preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-9 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          {/* Google Workspace & Drive */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Google Workspace & Drive Integration</h3>
                  <p className="text-xs text-slate-400">
                    Connect Gmail to send and receive customer emails, and Google Drive to sync knowledge documents.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Google OAuth Active
                </span>
              </div>

              {/* 1. Gmail Connection Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{gmailAccount.email}</h4>
                      <p className="text-[11px] text-slate-400">
                        Status:{' '}
                        <strong
                          className={
                            gmailAccount.status === 'connected'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }
                        >
                          {gmailAccount.status.toUpperCase()}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {gmailAccount.status === 'connected' ? (
                      <>
                        <button
                          onClick={() => syncGmailInbox()}
                          disabled={isSyncingGmail}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
                          <span>{isSyncingGmail ? 'Scanning...' : 'Sync Inbox'}</span>
                        </button>
                        <button
                          onClick={handleSendTestEmail}
                          disabled={isSendingTestEmail}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3 text-sky-400" />
                          <span>{isSendingTestEmail ? 'Sending...' : 'Test Send'}</span>
                        </button>
                        <button
                          onClick={disconnectGmail}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => connectGmail()}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow transition-all"
                      >
                        Connect Gmail
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Daily Quota</span>
                    <span className="font-mono font-bold text-white">
                      {gmailAccount.dailySentCount} / {gmailAccount.dailyQuota} sent
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Gmail OAuth Scopes</span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      gmail.readonly, gmail.send, gmail.modify
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Google Drive Integration Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Drive Ingestion & Backup</h4>
                      <p className="text-[11px] text-slate-400">
                        Sync company guidelines, price sheets, and SOPs directly into Mailora AI
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDriveModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all flex items-center gap-1.5 shadow"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Browse Drive Docs</span>
                    </button>
                    <button
                      onClick={handleExportDriveBackup}
                      disabled={isExportingDrive}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3 h-3 text-amber-400" />
                      <span>{isExportingDrive ? 'Exporting...' : 'Backup KB'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Documents Synced</span>
                    <span className="font-mono font-bold text-white">
                      {knowledge.filter(k => k.sourceFileType === 'GOOGLE_DRIVE' || k.sourceDriveFileId).length} Google Drive Docs
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Google Drive OAuth Scopes</span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      drive.readonly, drive.file
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Firebase Firestore Status */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                      <Database className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Firebase Firestore Database</h4>
                      <p className="text-[11px] text-slate-400">
                        Multi-tenant cloud persistence for agent settings, knowledge chunks, and email threads
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Online & Deployed ✓
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">GCP Project ID</span>
                    <span className="font-mono text-white font-semibold">gen-lang-client-0944039715</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Firestore Region</span>
                    <span className="font-mono text-emerald-400 font-semibold">asia-southeast1</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Profile */}
          {activeTab === 'business' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Business Information</h3>
                <p className="text-xs text-slate-400">
                  This identity is used by Mailora to ground communications and contextual signatures.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Workspace Name
                  </label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={e => setBizName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry Vertical
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Operating Timezone
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSaveBusiness}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">My Account</h3>
                <p className="text-xs text-slate-400">Personal credentials and account access.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role in Business
                  </label>
                  <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    Owner & Workspace Administrator
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Plans */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Subscription & Usage</h3>
                  <p className="text-xs text-slate-400">Current tier and quota allocation.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subscription.plan} Plan
                </span>
              </div>

              {/* Usage Meters */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Monthly AI Emails Handled</span>
                    <span className="font-mono font-bold text-white">
                      {subscription.emailsHandled} / {subscription.emailQuota}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          (subscription.emailsHandled / subscription.emailQuota) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Knowledge Storage</span>
                    <span className="font-mono font-bold text-white">
                      {Math.round(subscription.storageBytesUsed / 1024)} KB / 500 MB
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '4%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Notification Alerts</h3>
                <p className="text-xs text-slate-400">Configure when Mailora sends you alerts.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Urgent Review Needed',
                    desc: 'Notify when an email requires human supervisor approval.',
                    checked: true,
                  },
                  {
                    title: 'Customer Escalation',
                    desc: 'Notify when a high-priority complaint or legal request arrives.',
                    checked: true,
                  },
                  {
                    title: 'Daily Summary Digest',
                    desc: 'Receive an evening breakdown of all automated replies sent.',
                    checked: false,
                  },
                  {
                    title: 'Google Drive Document Sync Alert',
                    desc: 'Notify when a synced document is updated in Google Drive.',
                    checked: true,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Firebase */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Security & Multi-Tenant Isolation</h3>
                <p className="text-xs text-slate-400">
                  Data protections and Firebase Firestore security posture.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Workspace Data Isolation</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Firestore security rules enforce that your knowledge base, emails, and agent instructions can only be read or written by authenticated members belonging to business ID "{business.id}".
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Least-Privilege Google OAuth</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tokens are kept in-memory during active sessions. Mailora requests only the scopes required to read inbound customer emails, dispatch authorized replies, and read selected Google Drive documents.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No Third-Party AI Model Training</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Customer emails and Google Drive documents are never used to train public foundation models. Information is strictly utilized in real-time RAG context retrieval.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <div className="space-y-5">
              <div className="border-b border-rose-900/50 pb-3">
                <h3 className="text-base font-bold text-rose-400">Danger Zone</h3>
                <p className="text-xs text-slate-400">Irreversible workspace actions.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Purge Knowledge Base</h4>
                  <p className="text-[11px] text-slate-400">
                    Delete all indexed knowledge documents, FAQs, and Google Drive references.
                  </p>
                </div>
                <button
                  onClick={() =>
                    addToast({
                      type: 'warning',
                      title: 'Knowledge Base Purge',
                      message: 'Action simulated in preview mode.',
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all"
                >
                  Purge Documents
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
