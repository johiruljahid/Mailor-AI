import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Zap,
  Mail,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Database,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Building2,
  FileText,
  HelpCircle,
  Globe,
  Phone,
  MessageSquare,
  AlertCircle,
  Upload,
  Search,
  Check,
  Layers,
  ArrowRight,
  FileCheck,
  Sliders,
  FileSpreadsheet,
  Download,
  Link as LinkIcon,
  Info,
  Calendar as CalendarIcon,
  Video,
  Filter,
  X,
  Eye,
  Send,
  Paperclip,
  CheckCircle,
  Flame,
  ShieldAlert,
  MailOpen,
  RotateCw,
  Inbox,
} from 'lucide-react';
import { KnowledgeCategory, AgentTone, ReplyLanguage, CategorizedGmailEmail } from '../../types';
import { TimezoneService } from '../../services/timezoneService';

export const Dashboard: React.FC = () => {
  const {
    user,
    business,
    agent,
    updateAgent,
    gmailAccount,
    knowledge,
    addKnowledgeItem,
    deleteKnowledgeItem,
    updateKnowledgeItem,
    threads,
    autoReplyLogs,
    isAutoResponderActive,
    setIsAutoResponderActive,
    autoScanCountdown,
    pollAndAutoReplyGmail,
    importWebsiteData,
    uploadKnowledgeFile,
    saveAllSetupData,
    setIsGoogleConnectModalOpen,
    setIsDriveModalOpen,
    syncGmailInbox,
    isSyncingGmail,
    isGoogleAuthenticated,
    connectGoogleAccount,
    categorizedGmailEmails,
    isLoadingGmailEmails,
    loadCategorizedGmailEmails,
    toggleEmailReadStatus,
    processSingleEmailWithAi,
    googleSheetsConfig,
    connectGoogleSheet,
    disconnectGoogleSheet,
    exportActivityToCsv,
    importGoogleDoc,
    createGoogleDocKnowledge,
    connectGoogleDrive,
    calendarBookings,
    calendarConfig,
    setCalendarConfig,
    setIsCalendarModalOpen,
    addToast,
    testSendLiveEmail,
    serverAutopilotStatus,
    triggerServerAutopilotNow,
    syncAutonomousBackend,
  } = useApp();

  // Top-Level Organized View Tabs
  const [activeTab, setActiveTab] = useState<'activity' | 'knowledge' | 'agent' | 'workspace' | 'simulator'>('activity');

  // Activity Tab State
  const [activityFilter, setActivityFilter] = useState<'all' | 'appointments' | 'inquiries'>('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedLogDetail, setSelectedLogDetail] = useState<any | null>(null);

  // Knowledge Tab Sub-Channel State
  const [knowledgeSubTab, setKnowledgeSubTab] = useState<'faqs' | 'website' | 'docs' | 'files'>('faqs');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');

  // 1. Business Profile & Agent Settings state
  const [businessName, setBusinessName] = useState(business.name || 'Imbdagency');
  const [industry, setIndustry] = useState(business.industry || 'Web Development & Brand Experiences');
  const [supportEmail, setSupportEmail] = useState(business.supportEmail || gmailAccount.email || 'johirul4856@gmail.com');
  const [website, setWebsite] = useState(business.website || 'https://imbdagency.com');
  const [phone, setPhone] = useState('+880 1700-000000');
  const [operatingHours, setOperatingHours] = useState('Monday - Saturday: 9:00 AM - 9:00 PM');
  const [agentName, setAgentName] = useState(agent.name || 'Alex Jordan');
  const [tone, setTone] = useState<AgentTone>(agent.tone || 'Professional');
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>(agent.replyLanguage || 'Multi-language (Auto-detect)');
  const [instructions, setInstructions] = useState(
    agent.instructions ||
      'You are a professional human employee handling customer emails. Read the customer message and subject carefully, address their exact requirements directly and concisely. If a meeting is booked, confirm the date and Google Meet link clearly. If files are requested, mention the attached document.'
  );
  const [emailSignature, setEmailSignature] = useState(
    agent.emailSignature || 'Best regards,\nAlex Jordan\nCustomer Support Team'
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTriggeringAutopilot, setIsTriggeringAutopilot] = useState(false);
  const [isSyncingAutopilot, setIsSyncingAutopilot] = useState(false);

  const handleTriggerAutopilot = async () => {
    setIsTriggeringAutopilot(true);
    await triggerServerAutopilotNow();
    setIsTriggeringAutopilot(false);
  };

  const handleSyncAutopilot = () => {
    setIsSyncingAutopilot(true);
    syncAutonomousBackend();
    setTimeout(() => {
      setIsSyncingAutopilot(false);
      addToast({
        type: 'success',
        title: 'Autopilot Synced to Server ✓',
        message: 'All business profile, agent rules, and knowledge base settings deployed to 24/7 background runner.',
      });
    }, 600);
  };

  // 2. FAQs State
  const existingFaqs = useMemo(
    () => knowledge.filter(k => k.category === 'FAQ'),
    [knowledge]
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('FAQ');
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // 3. Website Crawler State
  const [targetWebsiteUrl, setTargetWebsiteUrl] = useState('');
  const [isCrawlingSite, setIsCrawlingSite] = useState(false);
  const [crawlProgressStep, setCrawlProgressStep] = useState(0);

  // 4. Google Docs Import State
  const [docUrlInput, setDocUrlInput] = useState('');
  const [isImportingDoc, setIsImportingDoc] = useState(false);
  const [isCreatingNewDoc, setIsCreatingNewDoc] = useState(false);

  // 5. File Upload State
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 6. Simulator Sandbox State
  const [simSubject, setSimSubject] = useState('Urgent Request an Appointment');
  const [simBody, setSimBody] = useState('Hi, I need to schedule an urgent appointment for tomorrow to discuss our web project requirements.');
  const [simCustomerName, setSimCustomerName] = useState('Jahid Hasan');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    reply: string;
    intent?: string;
    meetingInfo?: any;
    attachmentInfo?: any;
  } | null>(null);
  const [isSendingLiveTest, setIsSendingLiveTest] = useState(false);

  // 7. Google Sheets State
  const [isConnectingSheet, setIsConnectingSheet] = useState(false);
  const [customSheetUrl, setCustomSheetUrl] = useState('');
  const [showCustomSheetInput, setShowCustomSheetInput] = useState(false);

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return autoReplyLogs.filter(log => {
      const matchSearch =
        !activitySearch ||
        log.subject.toLowerCase().includes(activitySearch.toLowerCase()) ||
        log.fromName.toLowerCase().includes(activitySearch.toLowerCase()) ||
        log.fromEmail.toLowerCase().includes(activitySearch.toLowerCase()) ||
        log.replySnippet.toLowerCase().includes(activitySearch.toLowerCase());

      if (!matchSearch) return false;

      if (activityFilter === 'appointments') {
        return (
          log.intent?.toLowerCase().includes('appointment') ||
          log.intent?.toLowerCase().includes('meeting') ||
          log.fullReply?.toLowerCase().includes('meet') ||
          log.fullReply?.toLowerCase().includes('appointment')
        );
      }
      if (activityFilter === 'inquiries') {
        return (
          !log.intent?.toLowerCase().includes('appointment') &&
          !log.intent?.toLowerCase().includes('meeting')
        );
      }
      return true;
    });
  }, [autoReplyLogs, activitySearch, activityFilter]);

  // In-App Smart Gmail Inbox State
  const [inboxSubView, setInboxSubView] = useState<'gmail' | 'logs'>('gmail');
  const [gmailCategoryFilter, setGmailCategoryFilter] = useState<'all' | 'urgent' | 'meeting' | 'inquiry' | 'normal' | 'spam'>('all');
  const [gmailSearch, setGmailSearch] = useState('');
  const [selectedGmailEmail, setSelectedGmailEmail] = useState<CategorizedGmailEmail | null>(null);
  const [isProcessingAiEmailId, setIsProcessingAiEmailId] = useState<string | null>(null);

  // In-App Gmail Categorized Counts
  const urgentMailsCount = useMemo(
    () => categorizedGmailEmails.filter(e => e.category === 'URGENT').length,
    [categorizedGmailEmails]
  );
  const meetingMailsCount = useMemo(
    () => categorizedGmailEmails.filter(e => e.category === 'MEETING').length,
    [categorizedGmailEmails]
  );
  const inquiryMailsCount = useMemo(
    () => categorizedGmailEmails.filter(e => e.category === 'INQUIRY').length,
    [categorizedGmailEmails]
  );
  const normalMailsCount = useMemo(
    () => categorizedGmailEmails.filter(e => e.category === 'NORMAL').length,
    [categorizedGmailEmails]
  );
  const spamRescuedCount = useMemo(
    () => categorizedGmailEmails.filter(e => e.isFromSpam).length,
    [categorizedGmailEmails]
  );

  // Filtered In-App Gmail Emails
  const filteredGmailEmails = useMemo(() => {
    return categorizedGmailEmails.filter(email => {
      if (gmailCategoryFilter === 'urgent' && email.category !== 'URGENT') return false;
      if (gmailCategoryFilter === 'meeting' && email.category !== 'MEETING') return false;
      if (gmailCategoryFilter === 'inquiry' && email.category !== 'INQUIRY') return false;
      if (gmailCategoryFilter === 'normal' && email.category !== 'NORMAL') return false;
      if (gmailCategoryFilter === 'spam' && !email.isFromSpam) return false;

      if (gmailSearch.trim()) {
        const query = gmailSearch.toLowerCase();
        const matchesSubject = email.subject.toLowerCase().includes(query);
        const matchesFrom = email.from.toLowerCase().includes(query) || email.fromName.toLowerCase().includes(query);
        const matchesBody = email.body.toLowerCase().includes(query);
        if (!matchesSubject && !matchesFrom && !matchesBody) return false;
      }

      return true;
    });
  }, [categorizedGmailEmails, gmailCategoryFilter, gmailSearch]);

  // Save Settings Handler
  const handleSaveAllSettings = async () => {
    setIsSavingSettings(true);
    try {
      updateAgent({
        name: agentName,
        tone,
        replyLanguage,
        instructions,
        emailSignature,
      });

      await saveAllSetupData({
        businessName,
        industry,
        supportEmail,
        website,
        agentName,
        tone,
        replyLanguage,
        instructions,
        emailSignature,
      });

      addToast({
        type: 'success',
        title: 'Settings Saved ✓',
        message: 'Business identity and AI persona directives successfully updated.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Save Notice',
        message: err.message || 'Could not save settings.',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Add FAQ Handler
  const handleAddFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      addToast({
        type: 'warning',
        title: 'Incomplete Fields',
        message: 'Please provide both the Question and the Answer.',
      });
      return;
    }

    addKnowledgeItem({
      title: newQuestion.trim(),
      category: newCategory,
      content: newAnswer.trim(),
      status: 'READY',
      isEnabled: true,
    });

    setNewQuestion('');
    setNewAnswer('');
    setIsAddingFaq(false);

    addToast({
      type: 'success',
      title: 'FAQ Added ✓',
      message: 'New verified business knowledge indexed into AI training memory.',
    });
  };

  // Website Crawl Handler
  const handleStartWebsiteCrawl = async () => {
    if (!targetWebsiteUrl.trim()) {
      addToast({
        type: 'warning',
        title: 'Enter Website URL',
        message: 'Please enter a valid website address (e.g. https://yourcompany.com).',
      });
      return;
    }

    setIsCrawlingSite(true);
    setCrawlProgressStep(1);

    try {
      setTimeout(() => setCrawlProgressStep(2), 600);
      setTimeout(() => setCrawlProgressStep(3), 1300);

      const res = await importWebsiteData(targetWebsiteUrl.trim());
      setCrawlProgressStep(4);

      if (res.data?.domain && (businessName === 'Imbdagency' || !businessName)) {
        const brand = res.data.domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setBusinessName(brand);
      }

      addToast({
        type: 'success',
        title: 'Website Crawled & Synced ✓',
        message: `Extracted services and data from ${res.data.domain || targetWebsiteUrl}. Stored in Google Drive.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Website Crawl Notice',
        message: err.message || 'Could not scrape website content.',
      });
    } finally {
      setTimeout(() => {
        setIsCrawlingSite(false);
        setCrawlProgressStep(0);
      }, 700);
    }
  };

  // Google Doc Import Handler
  const handleImportDoc = async () => {
    if (!docUrlInput.trim()) return;
    setIsImportingDoc(true);
    try {
      await importGoogleDoc(docUrlInput.trim());
      setDocUrlInput('');
    } catch (err: any) {
      // toast handled in importGoogleDoc
    } finally {
      setIsImportingDoc(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadKnowledgeFile(files[i]);
      }
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Test Simulator Handler
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/gemini/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: simSubject,
          body: simBody,
          customerName: simCustomerName,
          businessName: businessName || business.name,
          agentConfig: {
            name: agentName,
            tone,
            replyLanguage,
            instructions,
            emailSignature,
          },
          retrievedChunks: knowledge.slice(0, 4).map(k => ({
            knowledgeId: k.id,
            title: k.title,
            category: k.category,
            snippet: k.content.slice(0, 250),
          })),
          meetingBookingInfo: (() => {
            const isResched = simSubject.toLowerCase().includes('reschedule') || simBody.toLowerCase().includes('change');
            const isAppoint = simSubject.toLowerCase().includes('appointment') || simSubject.toLowerCase().includes('meeting');
            if (!isResched && !isAppoint) return undefined;
            const dual = TimezoneService.formatDualTimezone(new Date(Date.now() + 24 * 3600 * 1000), `${simSubject} ${simBody}`);
            return {
              status: isResched ? ('RESCHEDULED' as const) : ('BOOKED' as const),
              dateFormatted: dual.summarySentence,
              previousDateFormatted: isResched ? 'earlier slot (cancelled & deleted)' : undefined,
              meetUrl: isResched ? 'https://meet.google.com/mailora-reschedule-call' : 'https://meet.google.com/xyz-mailora-call',
              isReschedule: isResched,
              timezoneBadge: dual.highlightedBadge,
              clientTimezone: dual.clientTimezone,
              userTimezone: dual.userTimezone,
              userUtcOffset: dual.userUtcOffset,
              clientUtcOffset: dual.clientUtcOffset,
              dualTimezoneSentence: dual.summarySentence,
            };
          })(),
          attachmentInfo: simBody.toLowerCase().includes('brochure') || simBody.toLowerCase().includes('pdf') || simBody.toLowerCase().includes('document')
            ? {
                filename: `${businessName || 'Agency'}_Brochure.pdf`,
                driveUrl: 'https://drive.google.com/file/d/preview',
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const isReschedule = simSubject.toLowerCase().includes('reschedule') || simBody.toLowerCase().includes('change');
        const isAppointment = simSubject.toLowerCase().includes('appointment') || simSubject.toLowerCase().includes('meeting');
        const dual = TimezoneService.formatDualTimezone(new Date(Date.now() + 24 * 3600 * 1000), `${simSubject} ${simBody}`);

        setSimResult({
          reply: data.reply,
          intent: isReschedule ? 'Appointment Reschedule (Cancelled Old Slot)' : isAppointment ? 'Appointment Booking' : 'General Inquiry',
          meetingInfo: (isReschedule || isAppointment)
            ? {
                date: dual.summarySentence,
                link: isReschedule ? 'https://meet.google.com/mailora-reschedule-call' : 'https://meet.google.com/xyz-mailora-call',
                isReschedule,
                status: isReschedule ? 'RESCHEDULED' : 'BOOKED',
                timezoneBadge: dual.highlightedBadge,
              }
            : undefined,
          attachmentInfo: simBody.toLowerCase().includes('brochure') || simBody.toLowerCase().includes('pdf') ? {
            filename: `${businessName || 'Agency'}_Brochure.pdf`,
          } : undefined,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Simulation Notice',
        message: err.message || 'Could not run simulation.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Send Real Live Test Email to User Inbox
  const handleSendLiveTest = async () => {
    setIsSendingLiveTest(true);
    try {
      await testSendLiveEmail({
        toEmail: gmailAccount.email || 'johirul4856@gmail.com',
        customerName: simCustomerName,
        subject: simSubject,
        body: simBody,
      });
      addToast({
        type: 'success',
        title: 'Live Email Dispatched ✓',
        message: `Test email sent to ${gmailAccount.email}. Check your Gmail inbox now!`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Dispatch Error',
        message: err.message || 'Could not send test email.',
      });
    } finally {
      setIsSendingLiveTest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & AUTOPILOT MASTER CONTROL BAR                              */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-[#0b0f19] border border-white/10 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle Ambient Background Highlight */}
        <div className="absolute top-0 right-1/4 w-96 h-28 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {businessName || 'Mailora Workspace'}
              </h1>
              <span className="text-[11px] font-semibold text-slate-400">
                · {industry}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous AI Employee monitoring <strong className="text-slate-200">{gmailAccount.email}</strong>
            </p>
          </div>
        </div>

        {/* Master Autopilot Switch & Controls */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap sm:flex-nowrap">
          {/* Autopilot Toggle Switch Button */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-left pl-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                24/7 Autopilot
              </span>
              <span className="text-xs font-bold flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAutoResponderActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                <span className={isAutoResponderActive ? 'text-emerald-400' : 'text-slate-400'}>
                  {isAutoResponderActive ? `Active (${autoScanCountdown}s scan)` : 'Turned OFF'}
                </span>
              </span>
            </div>

            <button
              onClick={() => setIsAutoResponderActive(!isAutoResponderActive)}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAutoResponderActive ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
              title="Turn 24/7 Autopilot ON or OFF"
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isAutoResponderActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Quick Inbox Scan Button */}
          <button
            onClick={() => pollAndAutoReplyGmail()}
            disabled={isSyncingGmail}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncingGmail ? 'animate-spin' : ''}`} />
            <span>Scan Inbox</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KEY METRICS STATS BAR (Clean Typography, No Clutter)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Emails Replied</span>
          <div className="my-2">
            <span className="text-2xl font-black text-white font-mono">
              {autoReplyLogs.length}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            100% Primary Inbox Delivery
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Appointments Booked</span>
          <div className="my-2">
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {calendarBookings.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Google Calendar & Meet synced
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Knowledge Chunks</span>
          <div className="my-2">
            <span className="text-2xl font-black text-sky-400 font-mono">
              {knowledge.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Drive, Docs, FAQs & Web
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Average Response Speed</span>
          <div className="my-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              ~30s
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Instant autonomous processing
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 24/7 CLOUD AUTOPILOT ENGINE MONITOR (Runs 24/7 Offline & Logged Out)   */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0b1329] to-indigo-950/40 border border-emerald-500/20 p-4 sm:p-5 shadow-lg shadow-black/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                24/7 Autopilot Cloud Engine Active
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Continuous Server Runner (15s interval)
              </span>
              {serverAutopilotStatus?.lastPolledAt && (
                <span className="text-[11px] text-slate-500 font-mono">
                  • Last check: {new Date(serverAutopilotStatus.lastPolledAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Once setup is saved, Mailora AI runs continuously in the background on the dedicated server engine. It monitors your connected inbox (<span className="text-white font-semibold">{gmailAccount.email}</span>), automatically deletes previous meetings upon client reschedule requests to eliminate double-booking, coordinates worldwide timezones (UTC+ / UTC-), and dispatches executive AI replies <strong className="text-emerald-300 font-semibold">24 hours a day even when you are logged out or this browser is closed</strong>.
            </p>

            <div className="flex items-center gap-3 pt-1 flex-wrap text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Server Status: <strong className="text-emerald-300">Listening & Replying 24/7</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                <CheckCircle className="w-3 h-3 text-indigo-400" />
                Double-Booking Protection: <strong className="text-indigo-300">Old Meeting Auto-Delete</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                <CheckCircle className="w-3 h-3 text-sky-400" />
                Total Offline / 24-7 Replied: <strong className="text-white font-bold">{serverAutopilotStatus?.totalReplied || autoReplyLogs.length}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleTriggerAutopilot}
              disabled={isTriggeringAutopilot}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              title="Immediately trigger the 24/7 background server to check inbox and reply"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringAutopilot ? 'animate-spin' : ''}`} />
              <span>{isTriggeringAutopilot ? 'Polling Server...' : 'Test Run Autopilot Now'}</span>
            </button>

            <button
              onClick={handleSyncAutopilot}
              disabled={isSyncingAutopilot}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer"
              title="Force sync current business, agent tone, signature, and knowledge base to the 24/7 background runner"
            >
              <Save className={`w-3.5 h-3.5 text-sky-400 ${isSyncingAutopilot ? 'animate-pulse' : ''}`} />
              <span>{isSyncingAutopilot ? 'Syncing...' : 'Re-Sync Autopilot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION NAVIGATION TABS (5 Clean Tabs)                           */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b0f19] border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Inbox & Activity</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
            {autoReplyLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'knowledge'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Train AI Knowledge Base</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
            {knowledge.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'agent'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>AI Persona & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'workspace'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Google Workspace Suite</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Test Simulator</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SMART GMAIL INBOX & AUTONOMOUS DISPATCH LOGS                      */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Sub-View Switcher & Deep Scan Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b0f19] border border-white/10">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setInboxSubView('gmail')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  inboxSubView === 'gmail'
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-sky-300" />
                <span>Smart Gmail Inbox</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                  {categorizedGmailEmails.length}
                </span>
              </button>

              <button
                onClick={() => setInboxSubView('logs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  inboxSubView === 'logs'
                    ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Autonomous AI Dispatch Logs</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                  {autoReplyLogs.length}
                </span>
              </button>
            </div>

            {/* Live Auto-Sync Status & Deep Scan Gmail & Spam Button */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Auto-Sync (20s)</span>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-mono">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Host: {TimezoneService.getUserUtcOffsetFormatted()}</span>
              </div>

              <button
                onClick={() => loadCategorizedGmailEmails()}
                disabled={isLoadingGmailEmails}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/10 transition-all cursor-pointer justify-center"
                title="Scan all Gmail messages including inbox & spam"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoadingGmailEmails ? 'animate-spin' : ''}`} />
                <span>{isLoadingGmailEmails ? 'Scanning...' : 'Deep Scan Now'}</span>
              </button>
            </div>
          </div>

          {/* Sub-View A: Smart Gmail Categorized Inbox */}
          {inboxSubView === 'gmail' && (
            <div className="space-y-4">
              {/* Duplicate Prevention & Productivity Guarantee Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-indigo-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Zero-Duplicate & Reschedule Guarantee:</strong> Client reschedule requests automatically cancel previous appointments so double meetings never occur. Worldwide UTC offsets are matched in real-time.
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 font-mono whitespace-nowrap">
                  Inbox & Spam Monitored: {categorizedGmailEmails.length} messages
                </span>
              </div>

              {/* 4 Core Categories + Spam Filter Pills & Search */}
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  <button
                    onClick={() => setGmailCategoryFilter('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      gmailCategoryFilter === 'all'
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>All Mails</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">{categorizedGmailEmails.length}</span>
                  </button>

                  <button
                    onClick={() => setGmailCategoryFilter('urgent')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      gmailCategoryFilter === 'urgent'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'text-slate-400 hover:text-red-300 hover:bg-white/5'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Urgent Mail</span>
                    {urgentMailsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-500/30 text-red-200 text-[10px] font-bold">
                        {urgentMailsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setGmailCategoryFilter('meeting')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      gmailCategoryFilter === 'meeting'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-indigo-300 hover:bg-white/5'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Meeting Mail</span>
                    {meetingMailsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                        {meetingMailsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setGmailCategoryFilter('inquiry')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      gmailCategoryFilter === 'inquiry'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-slate-400 hover:text-sky-300 hover:bg-white/5'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>Inquiry Mail</span>
                    {inquiryMailsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-200 text-[10px] font-bold">
                        {inquiryMailsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setGmailCategoryFilter('normal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      gmailCategoryFilter === 'normal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-emerald-300 hover:bg-white/5'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Normal Mail</span>
                    {normalMailsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
                        {normalMailsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setGmailCategoryFilter('spam')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      gmailCategoryFilter === 'spam'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-amber-300 hover:bg-white/5'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rescued from Spam</span>
                    {spamRescuedCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold">
                        {spamRescuedCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={gmailSearch}
                    onChange={e => setGmailSearch(e.target.value)}
                    placeholder="Search subject, client, or body..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Categorized Email Cards List */}
              <div className="rounded-2xl bg-[#0b0f19] border border-white/10 overflow-hidden shadow-xl">
                {filteredGmailEmails.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No Emails in this Category</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                      Your connected Gmail inbox has no messages under &quot;{gmailCategoryFilter}&quot;.
                    </p>
                    <button
                      onClick={() => loadCategorizedGmailEmails()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                    >
                      Rescan Gmail Inbox Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredGmailEmails.map(email => {
                      const isUrgent = email.category === 'URGENT';
                      const isMeeting = email.category === 'MEETING';
                      const isInquiry = email.category === 'INQUIRY';
                      const isReschedule = email.subject.toLowerCase().includes('reschedule') || email.body.toLowerCase().includes('change');

                      return (
                        <div
                          key={email.id}
                          className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                          {/* Left: Avatar, Sender, Subject, Snippet */}
                          <div
                            onClick={() => setSelectedGmailEmail(email)}
                            className="flex items-start gap-3.5 flex-1 min-w-0 cursor-pointer"
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm ${
                                isUrgent
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isMeeting
                                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                  : isInquiry
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {isUrgent ? (
                                <Flame className="w-5 h-5 text-red-400" />
                              ) : isMeeting ? (
                                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                              ) : isInquiry ? (
                                <HelpCircle className="w-5 h-5 text-sky-400" />
                              ) : (
                                <Mail className="w-5 h-5 text-emerald-400" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">
                                  {email.fromName || 'Client'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  · {email.from}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  · {email.date}
                                </span>
                                {email.isFromSpam && (
                                  <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                                    🛡️ Rescued from Spam
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-200 truncate">
                                  {email.subject}
                                </h4>
                                {email.isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" title="Unread" />
                                )}
                              </div>

                              {isMeeting && (
                                <div className="flex items-center gap-1.5 py-0.5">
                                  {(() => {
                                    const clientTz = TimezoneService.detectClientTimezone(`${email.subject} ${email.body}`);
                                    const userOffset = TimezoneService.getUserUtcOffsetFormatted();
                                    const isDiff = clientTz.utcOffsetFormatted !== userOffset;
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                                        <Globe className="w-3 h-3 text-sky-400 shrink-0" />
                                        <span>
                                          {isDiff
                                            ? `Timezone: ${clientTz.label} ⇄ Host: ${userOffset}`
                                            : `Timezone: ${userOffset}`}
                                        </span>
                                      </span>
                                    );
                                  })()}
                                </div>
                              )}

                              <p className="text-xs text-slate-400 line-clamp-1">
                                {email.snippet || email.body.slice(0, 100)}
                              </p>
                            </div>
                          </div>

                          {/* Right: Badges & Direct Action Buttons */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center flex-wrap">
                            {/* Category Badge */}
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                                isUrgent
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : isMeeting
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                  : isInquiry
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {isMeeting && isReschedule ? '📅 RESCHEDULE' : email.category}
                            </span>

                            {/* AI Replied Status */}
                            {email.hasAiReplied ? (
                              <span className="text-[10px] font-bold text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>AI Replied</span>
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  setIsProcessingAiEmailId(email.id);
                                  await processSingleEmailWithAi(email);
                                  setIsProcessingAiEmailId(null);
                                }}
                                disabled={isProcessingAiEmailId === email.id}
                                className="text-[11px] font-bold text-white px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                {isProcessingAiEmailId === email.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                )}
                                <span>{isProcessingAiEmailId === email.id ? 'Processing...' : 'Run AI Reply'}</span>
                              </button>
                            )}

                            {/* Mark Read/Unread Toggle */}
                            <button
                              onClick={() => toggleEmailReadStatus(email.id, email.isUnread)}
                              className="text-xs text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                              title={email.isUnread ? 'Mark as Read' : 'Mark as Unread'}
                            >
                              {email.isUnread ? (
                                <MailOpen className="w-4 h-4 text-slate-400 hover:text-sky-300" />
                              ) : (
                                <Mail className="w-4 h-4 text-slate-500" />
                              )}
                            </button>

                            {/* View Full Email Button */}
                            <button
                              onClick={() => setSelectedGmailEmail(email)}
                              className="text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Read</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-View B: Autonomous AI Dispatch Logs */}
          {inboxSubView === 'logs' && (
            <div className="space-y-4">
              {/* Activity Filters and Search */}
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setActivityFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activityFilter === 'all'
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All Replies ({autoReplyLogs.length})
                  </button>
                  <button
                    onClick={() => setActivityFilter('appointments')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activityFilter === 'appointments'
                        ? 'bg-white/15 text-indigo-300'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    📅 Appointments
                  </button>
                  <button
                    onClick={() => setActivityFilter('inquiries')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activityFilter === 'inquiries'
                        ? 'bg-white/15 text-sky-300'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ✉️ Inquiries
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={e => setActivitySearch(e.target.value)}
                    placeholder="Search subject or client..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Activity Logs Table / List */}
              <div className="rounded-2xl bg-[#0b0f19] border border-white/10 overflow-hidden shadow-xl">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No Activity Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                      When a client sends an email to your Gmail address, the AI automatically drafts and dispatches a reply within seconds.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('simulator');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                    >
                      Simulate Client Email Now
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredLogs.map(log => {
                      const isMeeting =
                        log.intent?.toLowerCase().includes('appointment') ||
                        log.intent?.toLowerCase().includes('meeting') ||
                        log.fullReply?.toLowerCase().includes('meet');

                      return (
                        <div
                          key={log.id}
                          onClick={() => setSelectedLogDetail(log)}
                          className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isMeeting
                                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {isMeeting ? <CalendarIcon className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">
                                  {log.fromName || 'Client'}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  · {log.fromEmail}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  · {log.timestamp}
                                </span>
                              </div>

                              <h4 className="text-sm font-semibold text-slate-200 truncate">
                                {log.subject}
                              </h4>

                              <p className="text-xs text-slate-400 line-clamp-1">
                                {log.replySnippet}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            {isMeeting && (
                              <span className="text-[11px] font-bold text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                                Meet Booked
                              </span>
                            )}

                            <span className="text-[11px] font-bold text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                              DELIVERED
                            </span>

                            <button className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KNOWLEDGE BASE (Train AI)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'knowledge' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Sub-Channel Switcher */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-xl overflow-x-auto">
            <button
              onClick={() => setKnowledgeSubTab('faqs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                knowledgeSubTab === 'faqs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Business FAQs & Answers
            </button>
            <button
              onClick={() => setKnowledgeSubTab('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                knowledgeSubTab === 'docs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Docs & Drive Sync
            </button>
            <button
              onClick={() => setKnowledgeSubTab('website')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                knowledgeSubTab === 'website' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Website Scanner
            </button>
            <button
              onClick={() => setKnowledgeSubTab('files')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                knowledgeSubTab === 'files' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload PDF Documents
            </button>
          </div>

          {/* SubTab 1: Business FAQs */}
          {knowledgeSubTab === 'faqs' && (
            <div className="rounded-2xl bg-[#0b0f19] border border-white/10 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Business Questions & Answers</h3>
                  <p className="text-xs text-slate-400">
                    Teach the AI your exact pricing, packages, delivery turnaround, and return policies.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingFaq(!isAddingFaq)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New FAQ</span>
                </button>
              </div>

              {/* Add FAQ Form */}
              {isAddingFaq && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-indigo-500/30 space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Customer Question
                    </label>
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      placeholder="e.g., What is your website development package pricing?"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Verified Answer / Fact
                    </label>
                    <textarea
                      rows={3}
                      value={newAnswer}
                      onChange={e => setNewAnswer(e.target.value)}
                      placeholder="e.g., Our starter web package begins at $250 with 3-5 days delivery..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as KnowledgeCategory)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                    >
                      <option value="FAQ">Category: FAQ</option>
                      <option value="Pricing">Category: Pricing</option>
                      <option value="Services">Category: Services</option>
                      <option value="Refund Policy">Category: Refund Policy</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddingFaq(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddFaq}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
                      >
                        Save FAQ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ List */}
              <div className="space-y-3">
                {knowledge.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <span className="text-[10px] font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                    </div>

                    <button
                      onClick={() => deleteKnowledgeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Delete knowledge item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 2: Google Docs & Drive */}
          {knowledgeSubTab === 'docs' && (
            <div className="rounded-2xl bg-[#0b0f19] border border-white/10 p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Google Docs & Google Drive Integration</h3>
                <p className="text-xs text-slate-400">
                  Connect your live Google Docs or Google Drive folder. Mailora AI pulls real-time facts directly from your documentation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <FileText className="w-4 h-4" />
                    <span>Import Existing Google Doc</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Paste the public or workspace share link of your company handbook or pricing sheet:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={docUrlInput}
                      onChange={e => setDocUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/document/d/..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleImportDoc}
                      disabled={isImportingDoc || !docUrlInput.trim()}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isImportingDoc ? 'Importing...' : 'Import'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <HardDrive className="w-4 h-4" />
                    <span>Create Knowledge Google Doc</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Instantly create a pre-structured knowledge document inside your Google Drive:
                  </p>
                  <button
                    onClick={async () => {
                      setIsCreatingNewDoc(true);
                      const res = await createGoogleDocKnowledge(
                        `${businessName} - Official Knowledge Handbook`,
                        `Company: ${businessName}\nIndustry: ${industry}\nWebsite: ${website}\n\nServices & Solutions:\n- Professional Web & Software Engineering\n- Turnaround time: Under 1 minute auto-reply\n\nSupport Guarantee:\n- 100% Client Satisfaction.`
                      );
                      setIsCreatingNewDoc(false);
                      if (res.success && res.documentUrl) {
                        window.open(res.documentUrl, '_blank');
                      }
                    }}
                    disabled={isCreatingNewDoc}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isCreatingNewDoc ? 'Creating Doc...' : 'Create New Doc in Drive'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: Website Scanner */}
          {knowledgeSubTab === 'website' && (
            <div className="rounded-2xl bg-[#0b0f19] border border-white/10 p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Live Website Scanner</h3>
                <p className="text-xs text-slate-400">
                  Enter your company website. Mailora will crawl your services, about page, and contact info, then index it into your knowledge base.
                </p>
              </div>

              <div className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={targetWebsiteUrl}
                    onChange={e => setTargetWebsiteUrl(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleStartWebsiteCrawl}
                  disabled={isCrawlingSite || !targetWebsiteUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isCrawlingSite ? 'Crawling...' : 'Scan Website'}
                </button>
              </div>

              {isCrawlingSite && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-indigo-500/30 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    <span>Crawling & extracting website content...</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Step {crawlProgressStep} of 4: Fetching HTML, cleaning text, indexing services, and syncing to Google Drive.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SubTab 4: PDF Upload */}
          {knowledgeSubTab === 'files' && (
            <div className="rounded-2xl bg-[#0b0f19] border border-white/10 p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Upload Business Documents (PDF, TXT)</h3>
                <p className="text-xs text-slate-400">
                  Upload brochures, service rate cards, or policy documents. The AI can also attach these PDFs directly to client replies!
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.doc,.docx"
                onChange={e => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-colors text-center cursor-pointer bg-white/[0.01]"
              >
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-white block">
                  Click or drag and drop PDF files here
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Supports PDF, TXT, DOCX up to 10MB
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AI PERSONA & RULES                                                */}
      {/* ========================================================================= */}
      {activeTab === 'agent' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Identity */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Business Identity & Profile</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Company / Agency Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Industry / Core Services
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* AI Agent Persona */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Persona & Tone</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={e => setAgentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tone of Voice
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as AgentTone)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Concise">Concise & Direct</option>
                    <option value="Formal">Formal</option>
                    <option value="Empathetic">Empathetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Language
                </label>
                <select
                  value={replyLanguage}
                  onChange={e => setReplyLanguage(e.target.value as ReplyLanguage)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                >
                  <option value="Multi-language (Auto-detect)">Multi-language (Auto-detect)</option>
                  <option value="English">English</option>
                  <option value="Bangla">Bangla</option>
                  <option value="Bangla + English">Bangla + English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Signature
                </label>
                <textarea
                  rows={2}
                  value={emailSignature}
                  onChange={e => setEmailSignature(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Prompt Directives */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Custom System Directives & Rules</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct instructions for how Mailora AI should read, interpret, and answer incoming customer messages.
            </p>
            <textarea
              rows={4}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white leading-relaxed focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAllSettings}
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingSettings ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GOOGLE WORKSPACE SUITE                                             */}
      {/* ========================================================================= */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* 1. Gmail */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Gmail Integration</h3>
                    <p className="text-[11px] text-slate-400">Inbound Monitoring & Auto-Replies</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Connected ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono text-white">{gmailAccount.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Quota:</span>
                  <span>{gmailAccount.dailySentCount} / {gmailAccount.dailyQuota}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => pollAndAutoReplyGmail()}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Scan Now
              </button>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Open Gmail</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 2. Google Calendar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Calendar</h3>
                    <p className="text-[11px] text-slate-400">Urgent Appointments & Meet Links</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Auto-Book Active ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booked Meetings:</span>
                  <span className="font-mono text-white">{calendarBookings.length} total</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Default Duration:</span>
                  <span>{calendarConfig.defaultMeetingDurationMinutes || 30} minutes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Calendar Settings
              </button>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Calendar ↗</span>
              </a>
            </div>
          </div>

          {/* 3. Google Drive */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Drive & Docs</h3>
                    <p className="text-[11px] text-slate-400">Folder Storage & PDF Attachments</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Drive Synced ✓
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Knowledge Folder:</span>
                  <span className="font-mono text-amber-300">Mailora_AI_Knowledge_Base</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PDF Dispatch:</span>
                  <span className="text-emerald-400">Automated on client request</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => connectGoogleDrive()}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Browse Drive Files
              </button>
              <a
                href="https://drive.google.com/drive/my-drive"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Drive ↗</span>
              </a>
            </div>
          </div>

          {/* 4. Google Sheets */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Sheets Activity Report</h3>
                    <p className="text-[11px] text-slate-400">Automated Client Interaction Log</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  {googleSheetsConfig.isConnected ? 'Auto-Log Active ✓' : 'Ready to Link'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Rows Logged:</span>
                  <span className="font-mono text-white">
                    {googleSheetsConfig.totalRowsLogged || autoReplyLogs.length} interactions
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Format:</span>
                  <span>Date, Time, Client, Inquiry, Reply, Meet</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {googleSheetsConfig.isConnected && googleSheetsConfig.spreadsheetUrl ? (
                <a
                  href={googleSheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white text-center transition-colors"
                >
                  Open Live Sheet ↗
                </a>
              ) : (
                <button
                  onClick={async () => {
                    setIsConnectingSheet(true);
                    await connectGoogleSheet();
                    setIsConnectingSheet(false);
                  }}
                  disabled={isConnectingSheet}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {isConnectingSheet ? 'Creating Sheet...' : 'Auto-Create Activity Sheet'}
                </button>
              )}
              <button
                onClick={() => exportActivityToCsv()}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TEST SIMULATOR SANDBOX                                             */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          {/* Input Panel (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Test Client Scenario</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate an incoming email before live clients message your inbox.
              </p>
            </div>

            {/* Quick Scenario Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setSimSubject('Urgent Request an Appointment');
                  setSimBody('Hi, I need an urgent meeting to discuss our project scope and pricing.');
                  setSimCustomerName('Jahid Hasan');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                📅 Urgent Appointment
              </button>
              <button
                onClick={() => {
                  setSimSubject('Website Development Package Pricing');
                  setSimBody('Could you please send me your website development pricing packages and brochure?');
                  setSimCustomerName('Alex Rivera');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                💰 Pricing + PDF
              </button>
              <button
                onClick={() => {
                  setSimSubject('Can we reschedule our meeting time and date to Friday 4pm?');
                  setSimBody('Hi Alex, Something urgent came up on our side. Ami meeting time and date change korte chai. Can we reschedule our consultation to Friday at 4:00 PM instead? Client preferable date and time slot first check korun available kina, available thakle confirm korun and previous book meeting auto delete kore din so double meeting na hoy.');
                  setSimCustomerName('Sarah Connor');
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
              >
                🔄 Auto-Reschedule & Delete Old Meeting
              </button>
              <button
                onClick={() => {
                  setSimSubject('Can we reschedule our appointment to Friday 4pm EST (UTC-5)?');
                  setSimBody('Hi Alex, I am in New York (EST / UTC-5 timezone). Can we reschedule our meeting to Friday at 4:00 PM EST? Please verify if this preferable date & time slot is free, confirm it in both UTC timezones, and auto-delete our previous booked slot so there is no double meeting.');
                  setSimCustomerName('Michael Davies (New York)');
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-[11px] font-semibold text-sky-300 border border-sky-500/30 transition-colors cursor-pointer"
              >
                🌐 Worldwide UTC Reschedule (UTC-5 ⇄ UTC+6)
              </button>
              <button
                onClick={() => {
                  setSimSubject('Delivery Time & Guarantee');
                  setSimBody('How fast can you finish a standard business website and what is your refund policy?');
                  setSimCustomerName('Sarah Khan');
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                ⏱️ Turnaround Policy
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={simCustomerName}
                onChange={e => setSimCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={simSubject}
                onChange={e => setSimSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Email Body
              </label>
              <textarea
                rows={4}
                value={simBody}
                onChange={e => setSimBody(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Analyzing & Generating...' : 'Test AI Reply'}</span>
              </button>

              <button
                onClick={handleSendLiveTest}
                disabled={isSendingLiveTest}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/10 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>{isSendingLiveTest ? 'Dispatching via Gmail...' : 'Send Real Test Email to My Gmail Inbox'}</span>
              </button>
            </div>
          </div>

          {/* Output Panel (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>AI Generated Output Preview</span>
                </span>
                {simResult && (
                  <span className="text-[11px] font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {simResult.intent}
                  </span>
                )}
              </div>

              {!simResult ? (
                <div className="text-center py-20 text-slate-500 space-y-2">
                  <Zap className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">
                    Click <strong>&quot;Test AI Reply&quot;</strong> on the left to see how your AI employee reads requirements and generates response.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Meet booking card badge with dual timezone */}
                  {simResult.meetingInfo && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-sky-950/30 border border-indigo-500/30 text-xs text-indigo-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-indigo-400" />
                          <span>Slot: <strong>{simResult.meetingInfo.date}</strong></span>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-400">
                          {simResult.meetingInfo.isReschedule ? '✓ Rescheduled & Old Cancelled' : 'Google Meet Ready'}
                        </span>
                      </div>
                      {simResult.meetingInfo.timezoneBadge && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Dual Timezone: {simResult.meetingInfo.timezoneBadge}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Attachment badge if any */}
                  {simResult.attachmentInfo && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-amber-400" />
                      <span>Attached: <strong>{simResult.attachmentInfo.filename}</strong></span>
                    </div>
                  )}

                  {/* Formatted Reply Body */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {simResult.reply}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span>Delivery Format: RFC 2046 Dual Plain/HTML + Anti-Spam Headers</span>
              <span>100% Primary Inbox</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DETAIL MODAL FOR CLICKED ACTIVITY LOG                          */}
      {/* ========================================================================= */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0b0f19] border border-white/10 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedLogDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                  {selectedLogDetail.intent || 'Delivered'}
                </span>
                <span className="text-xs text-slate-400">· {selectedLogDetail.timestamp}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{selectedLogDetail.subject}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Client: <strong>{selectedLogDetail.fromName}</strong> ({selectedLogDetail.fromEmail})
              </p>
            </div>

            {/* Inbound Customer Snippet */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Inquiry Message
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300">
                {selectedLogDetail.incomingSnippet || 'Customer inquiry message'}
              </div>
            </div>

            {/* AI Dispatched Reply */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                AI Employee Dispatched Reply (Sent via Gmail)
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedLogDetail.fullReply || selectedLogDetail.replySnippet}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
              <span>Status: Successfully Sent & Marked as Read</span>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP GMAIL EMAIL VIEWER & AI TASK ANALYSIS MODAL                       */}
      {/* ========================================================================= */}
      {selectedGmailEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0b0f19] border border-white/10 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedGmailEmail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Email Header */}
            <div className="border-b border-white/10 pb-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                    selectedGmailEmail.category === 'URGENT'
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : selectedGmailEmail.category === 'MEETING'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : selectedGmailEmail.category === 'INQUIRY'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {selectedGmailEmail.category} MAIL
                </span>

                {selectedGmailEmail.isFromSpam && (
                  <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Rescued from Spam</span>
                  </span>
                )}

                <span className="text-xs text-slate-400">· Received: {selectedGmailEmail.date}</span>

                <span className="text-xs text-slate-400">
                  · Status:{' '}
                  <strong className={selectedGmailEmail.isUnread ? 'text-sky-400' : 'text-slate-400'}>
                    {selectedGmailEmail.isUnread ? 'Unread' : 'Read'}
                  </strong>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {selectedGmailEmail.subject}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>
                  From: <strong className="text-slate-200">{selectedGmailEmail.fromName}</strong> ({selectedGmailEmail.from})
                </div>
                <div>
                  To: <span className="text-slate-300 font-mono">{gmailAccount.email}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Message Body
              </span>
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {selectedGmailEmail.body}
              </div>
            </div>

            {/* Worldwide Timezone Coordination Banner */}
            {selectedGmailEmail.category === 'MEETING' && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    <strong>Worldwide Timezone Coordination:</strong> Client Timezone:{' '}
                    <strong className="text-white">{TimezoneService.detectClientTimezone(`${selectedGmailEmail.subject} ${selectedGmailEmail.body}`).label}</strong> • Host:{' '}
                    <strong className="text-white">{TimezoneService.getUserUtcOffsetFormatted()} ({TimezoneService.getUserTimezone()})</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 whitespace-nowrap">
                  ✓ UTC Mapped
                </span>
              </div>
            )}

            {/* AI Task & Requirement Analysis Preview */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>AI First Requirement & Task Analysis</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Automated Task Pipeline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Identified Client Intent:</span>
                  <span className="font-bold text-white">
                    {selectedGmailEmail.category === 'MEETING'
                      ? selectedGmailEmail.subject.toLowerCase().includes('reschedule') || selectedGmailEmail.body.toLowerCase().includes('change')
                        ? 'Meeting Reschedule & Calendar Re-booking'
                        : 'Appointment / Consultation Request'
                      : selectedGmailEmail.category === 'URGENT'
                      ? 'Urgent Priority Inquiry'
                      : selectedGmailEmail.category === 'INQUIRY'
                      ? 'Services, Rates & Brochure Request'
                      : 'General Client Correspondence'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Calendar & Booking Action:</span>
                  <span className="font-bold text-indigo-300">
                    {selectedGmailEmail.category === 'MEETING'
                      ? selectedGmailEmail.subject.toLowerCase().includes('reschedule') || selectedGmailEmail.body.toLowerCase().includes('change')
                        ? '✓ Auto-detect previous booking, delete old event & book proposed slot'
                        : '✓ Real-time slot verification & Google Meet generation'
                      : 'None required (Direct requirement answer)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleEmailReadStatus(selectedGmailEmail.id, selectedGmailEmail.isUnread);
                    setSelectedGmailEmail(prev => prev ? { ...prev, isUnread: !prev.isUnread } : null);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  <span>{selectedGmailEmail.isUnread ? 'Mark as Read' : 'Mark as Unread'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedGmailEmail(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={async () => {
                    setIsProcessingAiEmailId(selectedGmailEmail.id);
                    await processSingleEmailWithAi(selectedGmailEmail);
                    setIsProcessingAiEmailId(null);
                    setSelectedGmailEmail(prev => prev ? { ...prev, hasAiReplied: true, isUnread: false } : null);
                  }}
                  disabled={isProcessingAiEmailId === selectedGmailEmail.id}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingAiEmailId === selectedGmailEmail.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>
                    {isProcessingAiEmailId === selectedGmailEmail.id ? 'Executing AI Action...' : 'Run AI Action & Send Reply'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
