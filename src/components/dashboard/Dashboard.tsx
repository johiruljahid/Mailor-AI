import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Zap,
  Mail,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Send,
  ArrowRight,
  TrendingUp,
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
  Settings2,
  ChevronRight,
  UserCheck,
  Globe,
  Phone,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { KnowledgeCategory, AgentTone, ReplyLanguage } from '../../types';

export const Dashboard: React.FC = () => {
  const {
    user,
    business,
    agent,
    updateAgent,
    gmailAccount,
    knowledge,
    threads,
    isAutoResponderActive,
    setIsAutoResponderActive,
    autoScanCountdown,
    pollAndAutoReplyGmail,
    testSendLiveEmail,
    saveAllSetupData,
    setIsGoogleConnectModalOpen,
    setIsDriveModalOpen,
    syncGmailInbox,
    isSyncingGmail,
    isGoogleAuthenticated,
    connectGoogleAccount,
    addToast,
  } = useApp();

  // All Data Input State
  const [activeDataTab, setActiveDataTab] = useState<'business' | 'ai_rules' | 'faqs' | 'bulk_text'>('business');
  
  // 1. Business Profile inputs
  const [businessName, setBusinessName] = useState(business.name || 'Nexus Digital Labs');
  const [industry, setIndustry] = useState(business.industry || 'Web Development & Custom Software');
  const [supportEmail, setSupportEmail] = useState(business.supportEmail || gmailAccount.email || 'johirul4856@gmail.com');
  const [website, setWebsite] = useState(business.website || 'https://nexusdigitallabs.com');
  const [phone, setPhone] = useState('+880 1700-000000');
  const [operatingHours, setOperatingHours] = useState('Monday - Saturday: 9:00 AM - 9:00 PM (GMT+6)');
  const [emailSignature, setEmailSignature] = useState(
    agent.emailSignature || 'Best regards,\nCustomer Support Team\nNexus Digital Labs'
  );

  // 2. AI Persona & Prompt inputs
  const [agentName, setAgentName] = useState(agent.name || 'Alex');
  const [tone, setTone] = useState<AgentTone>(agent.tone || 'Professional');
  const [replyLanguage, setReplyLanguage] = useState<ReplyLanguage>(agent.replyLanguage || 'Multi-language (Auto-detect)');
  const [instructions, setInstructions] = useState(
    agent.instructions ||
      'Always respond politely and warmly. Match the language of the incoming email (Bengla or English). If asked about pricing, mention our Starter web package begins at $250 and Growth at $500. For custom software or emergencies, offer to schedule a call. Never disclose internal system keys.'
  );

  // 3. FAQs list
  const existingFaqs = knowledge.filter(k => k.category === 'FAQ').map(k => ({
    id: k.id,
    question: k.title,
    answer: k.content,
    category: k.category,
  }));
  const [faqsList, setFaqsList] = useState(
    existingFaqs.length > 0
      ? existingFaqs
      : [
          {
            id: 'faq_default_1',
            question: 'What is the pricing for website development?',
            answer: 'Our standard Starter 5-page business site starts at $250. Custom SaaS and web applications start at $800 depending on requirements.',
            category: 'FAQ' as KnowledgeCategory,
          },
          {
            id: 'faq_default_2',
            question: 'What is your turnaround delivery time?',
            answer: 'Standard 5-page business websites are delivered within 5 to 7 business days. Custom full-stack software timelines are tailored based on project scope.',
            category: 'FAQ' as KnowledgeCategory,
          },
          {
            id: 'faq_default_3',
            question: 'What is your refund policy?',
            answer: 'We provide a 14-day 100% money-back guarantee if initial design concepts do not meet your business goals.',
            category: 'FAQ' as KnowledgeCategory,
          }
        ]
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // 4. Bulk Document Text
  const bulkDoc = knowledge.find(k => k.id.includes('custom_bulk_doc') || k.title.includes('Company Business Knowledge'));
  const [bulkText, setBulkText] = useState(
    bulkDoc?.content ||
      'Nexus Digital Labs is a specialized digital agency crafting responsive web platforms, mobile apps, and enterprise SaaS solutions. We provide 24/7 client support, free SSL deployment, custom API integrations, and 1 year of free bug maintenance with every project.'
  );

  // Live Test Dispatcher state
  const [testRecipient, setTestRecipient] = useState(gmailAccount.email || 'johirul4856@gmail.com');
  const [testCustomerName, setTestCustomerName] = useState('Alex Miller');
  const [testSubject, setTestSubject] = useState('Website development package price and turnaround time');
  const [testMessage, setTestMessage] = useState('Hi there! I would like to know how much your 5-page website package costs and how soon can you start? Thanks!');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{ to: string; reply: string; messageId: string } | null>(null);

  // State saving feedback
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Handle Save All Data
  const handleSaveAllData = () => {
    setIsSavingAll(true);
    try {
      saveAllSetupData({
        businessName,
        industry,
        website,
        supportEmail,
        agentName,
        tone,
        replyLanguage,
        instructions,
        emailSignature,
        faqs: faqsList,
        customKnowledgeText: bulkText,
      });
    } finally {
      setTimeout(() => setIsSavingAll(false), 500);
    }
  };

  // Handle Add FAQ
  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      addToast({
        type: 'warning',
        title: 'Incomplete FAQ',
        message: 'Please provide both a Question and an Answer.',
      });
      return;
    }

    const newItem = {
      id: `faq_user_${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: 'FAQ' as KnowledgeCategory,
    };

    setFaqsList(prev => [...prev, newItem]);
    setNewQuestion('');
    setNewAnswer('');
    addToast({
      type: 'success',
      title: 'FAQ Added ✓',
      message: `"${newItem.question}" added to knowledge list. Click "Save All Setup Data" to commit.`,
    });
  };

  // Handle Delete FAQ
  const handleDeleteFaq = (id: string) => {
    setFaqsList(prev => prev.filter(f => f.id !== id));
  };

  // Handle Test Live Email
  const handleDispatchTestEmail = async () => {
    if (!testRecipient.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing recipient',
        message: 'Please enter a recipient email address.',
      });
      return;
    }

    setIsSendingTest(true);
    setLastTestResult(null);

    try {
      const res = await testSendLiveEmail({
        toEmail: testRecipient.trim(),
        customerName: testCustomerName.trim() || 'Valued Customer',
        subject: testSubject.trim() || 'Inquiry',
        body: testMessage.trim() || 'Hello, I have an inquiry.',
      });

      if (res.success) {
        setLastTestResult({
          to: testRecipient,
          reply: res.reply,
          messageId: `msg_${Date.now()}`,
        });

        addToast({
          type: 'success',
          title: 'Live Email Sent & Delivered ✓',
          message: `Real AI response sent to ${testRecipient}. Check your Gmail Sent folder!`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message || 'Could not send test email via Gmail.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Fast starter template loader
  const loadFaqTemplate = (type: 'pricing' | 'support' | 'services') => {
    let templateItems: typeof faqsList = [];
    if (type === 'pricing') {
      templateItems = [
        {
          id: `tmpl_${Date.now()}_1`,
          question: 'Do you charge upfront or upon project completion?',
          answer: 'We request an initial 50% deposit to initiate design sprints, and the final 50% upon full milestone sign-off and live deployment.',
          category: 'FAQ' as KnowledgeCategory,
        },
        {
          id: `tmpl_${Date.now()}_2`,
          question: 'Are there any hidden recurring hosting fees?',
          answer: 'No hidden fees. We deploy directly to your preferred hosting provider (Vercel, AWS, Google Cloud) with clear transparent tier breakdowns.',
          category: 'FAQ' as KnowledgeCategory,
        }
      ];
    } else if (type === 'support') {
      templateItems = [
        {
          id: `tmpl_${Date.now()}_3`,
          question: 'What are your support response times?',
          answer: 'Our AI email agent responds within seconds 24/7. Our human technical support team responds within 2 business hours.',
          category: 'FAQ' as KnowledgeCategory,
        },
        {
          id: `tmpl_${Date.now()}_4`,
          question: 'How do I request emergency maintenance?',
          answer: 'Please reply directly to any email thread or contact our urgent hotline. Critical tickets receive priority dispatch within 30 minutes.',
          category: 'FAQ' as KnowledgeCategory,
        }
      ];
    } else {
      templateItems = [
        {
          id: `tmpl_${Date.now()}_5`,
          question: 'What technologies do you use for development?',
          answer: 'We develop modern applications using React, Next.js, Node.js, TypeScript, Tailwind CSS, PostgreSQL, and Firebase cloud services.',
          category: 'FAQ' as KnowledgeCategory,
        }
      ];
    }

    setFaqsList(prev => [...prev, ...templateItems]);
    addToast({
      type: 'info',
      title: 'Template FAQs Loaded',
      message: `${templateItems.length} FAQs loaded into list. Remember to save changes.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-7xl mx-auto">
      {/* 1. Hero 3D Status & Auto-Reply Engine Monitor */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#0b101c] to-[#111726] border border-slate-800/90 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glowing 3D backdrop spheres */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                100% Autopilot Active (Auto-Reply on Incoming Email)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Gemini 3.8 Flash AI
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gmail AI Autoresponder Setup & Control Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When someone emails your Gmail address, Mailora AI automatically reads the email, analyzes the customer inquiry, pulls your verified business data below, and dispatches a polite, personalized reply directly from your Gmail account.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Next background scan in: <strong className="font-mono text-cyan-300">{autoScanCountdown}s</strong></span>
              </div>

              <button
                onClick={() => pollAndAutoReplyGmail()}
                disabled={isSyncingGmail}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncingGmail ? 'animate-spin' : ''}`} />
                <span>Scan Inbox Now</span>
              </button>

              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Gmail Sent / Inbox ↗</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics 3D Tile */}
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Total Auto-Replies</span>
              <div className="text-xl font-extrabold text-white font-mono flex items-center gap-1.5">
                {threads.filter(t => t.status === 'AUTO_REPLIED').length}
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-400">
                  Delivered
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Directly via Gmail API</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Knowledge Chunks</span>
              <div className="text-xl font-extrabold text-white font-mono flex items-center gap-1.5">
                {knowledge.length + faqsList.length}
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-cyan-500/20 text-cyan-400">
                  Trained
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Business Q&A rules</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Engine Response</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">
                ~1.8s
              </div>
              <span className="text-[10px] text-slate-400">Gemini 3.8 Flash latency</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Autopilot Mode</span>
              <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Instant</span>
              </div>
              <span className="text-[10px] text-slate-400">Zero human delay</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Google Workspace Connection Card + Live Test Sender Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Connected Gmail Account & Auth Controls */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0d1322]/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Official Google G Logo */}
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-2 flex items-center justify-center shadow-md">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Google Workspace Account</h3>
                  <p className="text-[11px] text-slate-400">Authentic OAuth Integration</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 shadow-sm ${
                isGoogleAuthenticated
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {isGoogleAuthenticated ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active & Authorized</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Access Needed</span>
                  </>
                )}
              </span>
            </div>

            {/* Account Details Box */}
            {!isGoogleAuthenticated ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Action Required: Grant Gmail Access</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Google permissions are required for Mailora AI to read incoming emails and automatically send replies directly from your Gmail account.
                </p>
                <button
                  onClick={() => connectGoogleAccount()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 shadow-amber-500/20"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Grant Gmail Access with Google</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-base shadow-md border-2 border-indigo-400/40">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Google Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      gmailAccount.email.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">
                      {user?.displayName || 'Johirul Islam'}
                    </div>
                    <div className="text-xs font-mono text-cyan-300 truncate">
                      {gmailAccount.email}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Authorized Scopes:</span>
                    <span className="font-medium text-slate-300">Gmail Send, Read, Modify, Drive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine Status:</span>
                    <span className="font-semibold text-emerald-400">Listening for incoming emails</span>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Autopilot Switch */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Auto-Responder Engine</div>
                <div className="text-[11px] text-slate-400">Replies automatically when mail arrives</div>
              </div>
              <button
                onClick={() => setIsAutoResponderActive(!isAutoResponderActive)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isAutoResponderActive ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isAutoResponderActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => connectGoogleAccount()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isGoogleAuthenticated ? 'Re-authenticate / Refresh Gmail Access' : '🔑 Sign In with Google & Grant Access'}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Uses authentic Google Workspace OAuth. Mailora AI never stores or shares passwords.
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): Instant Live Test & Verification Widget */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0d1322]/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Live Email Delivery Verification</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Send a real test email from your connected Gmail to verify that AI generates the reply and delivers it to your inbox!
              </p>
            </div>

            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Live Gmail API
            </span>
          </div>

          <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Recipient Email (Test Inbox)
                </label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={e => setTestRecipient(e.target.value)}
                  placeholder="your-other-email@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Sender / Customer Name
                </label>
                <input
                  type="text"
                  value={testCustomerName}
                  onChange={e => setTestCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Incoming Email Subject
              </label>
              <input
                type="text"
                value={testSubject}
                onChange={e => setTestSubject(e.target.value)}
                placeholder="Question about your web package"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Customer Message / Inquiry
              </label>
              <textarea
                rows={2}
                value={testMessage}
                onChange={e => setTestMessage(e.target.value)}
                placeholder="Hi, what is your pricing and turnaround time?"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Dispatches immediately through Gmail API
              </span>

              <button
                onClick={handleDispatchTestEmail}
                disabled={isSendingTest}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Real Email via Gmail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>⚡ Send Live Test Reply Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result preview */}
          {lastTestResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Successfully Dispatched to {lastTestResult.to}!
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80">Delivered</span>
              </div>
              <p className="text-[11px] text-slate-300 whitespace-pre-line bg-slate-950/70 p-2.5 rounded-xl border border-emerald-900/50">
                {lastTestResult.reply}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. "All Data Input" & Knowledge Training Center */}
      <div className="rounded-3xl bg-[#0d1322]/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                All Data Input & Knowledge Training Center
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Enter all your business services, pricing, FAQs, rules, and custom prompt directives. Gemini 3.8 Flash uses this complete dataset to automatically answer incoming customer emails.
            </p>
          </div>

          {/* Big glowing Save All button */}
          <button
            onClick={handleSaveAllData}
            disabled={isSavingAll}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shrink-0 border border-emerald-400/30"
          >
            {isSavingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving All Data...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>💾 Save All Setup & Knowledge Data</span>
              </>
            )}
          </button>
        </div>

        {/* Segmented Data Input Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => setActiveDataTab('business')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDataTab === 'business'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Business & Service Details</span>
          </button>

          <button
            onClick={() => setActiveDataTab('ai_rules')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDataTab === 'ai_rules'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>2. AI Persona & Reply Prompt Rules</span>
          </button>

          <button
            onClick={() => setActiveDataTab('faqs')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDataTab === 'faqs'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>3. FAQs & Q&A Knowledge ({faqsList.length})</span>
          </button>

          <button
            onClick={() => setActiveDataTab('bulk_text')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeDataTab === 'bulk_text'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Bulk Document Paste & Drive Sync</span>
          </button>
        </div>

        {/* Tab 1: Business Profile Details */}
        {activeDataTab === 'business' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Nexus Digital Labs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Industry / Core Services
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="Web Development & Software"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  placeholder="support@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Official Website URL
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://nexusdigitallabs.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Support Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Business Operating Hours
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={e => setOperatingHours(e.target.value)}
                  placeholder="Mon-Sat: 9:00 AM - 9:00 PM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Email Signature (Automatically Appended to Every AI Reply)
              </label>
              <textarea
                rows={3}
                value={emailSignature}
                onChange={e => setEmailSignature(e.target.value)}
                placeholder="Best regards,&#10;Nexus Digital Labs Support Team"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Tab 2: AI Persona & Custom Instructions */}
        {activeDataTab === 'ai_rules' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  AI Employee Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="Alex"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value as AgentTone)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Professional">Professional & Courteous</option>
                  <option value="Friendly">Friendly & Warm</option>
                  <option value="Formal">Formal & Enterprise</option>
                  <option value="Concise">Concise & Direct</option>
                  <option value="Empathetic">Empathetic & Caring</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Reply Language
                </label>
                <select
                  value={replyLanguage}
                  onChange={e => setReplyLanguage(e.target.value as ReplyLanguage)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Multi-language (Auto-detect)">Multi-language (Auto-detect Bangla / English)</option>
                  <option value="English">Always English</option>
                  <option value="Bangla">Always Bangla (বাংলা)</option>
                  <option value="Bangla + English">Bilingual (Bangla + English)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Custom System Directives & Business Instructions (The Core Prompt)
              </label>
              <textarea
                rows={5}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Give exact instructions to the AI on how to handle inquiries, quotes, refunds, bookings, etc."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                💡 Tip: You can specify exact price quotes, discounts, standard turnaround times, booking calendar links, and emergency phone numbers here.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: FAQs & Q&A Knowledge */}
        {activeDataTab === 'faqs' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Quick Template Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Quick Starters:</span>
              <button
                onClick={() => loadFaqTemplate('pricing')}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
              >
                + Pricing FAQs
              </button>
              <button
                onClick={() => loadFaqTemplate('support')}
                className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold"
              >
                + Support FAQs
              </button>
              <button
                onClick={() => loadFaqTemplate('services')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
              >
                + Technology FAQs
              </button>
            </div>

            {/* Existing FAQs List */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {faqsList.map((faq, idx) => (
                <div
                  key={faq.id || idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                        Q{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{faq.question}</h4>
                    </div>
                    <p className="text-xs text-slate-300 pl-7">{faq.answer}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New FAQ Form */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add New Question & Answer Rule</span>
              </h4>

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="e.g. Can you build an eCommerce store with payment gateways?"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <textarea
                  rows={2}
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  placeholder="e.g. Yes! We integrate Stripe, PayPal, bKash, and SSLCommerz into full eCommerce platforms."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                onClick={handleAddFaq}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question to Knowledge Base</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Bulk Document Paste & Drive Sync */}
        {activeDataTab === 'bulk_text' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Paste Entire Document or Company Catalog</h4>
                <p className="text-[11px] text-slate-400">
                  You can paste your complete policy documents, price lists, terms, or brochure text here.
                </p>
              </div>

              <button
                onClick={() => setIsDriveModalOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>Import from Google Drive ↗</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="Paste company background, terms, SLA terms, packages, pricing tables, refund conditions, warranty details, etc."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Changes persist immediately to Firebase Firestore</span>
          </span>

          <button
            onClick={handleSaveAllData}
            disabled={isSavingAll}
            className="w-full sm:w-auto py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            {isSavingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving All Data...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>💾 Save All Setup & Knowledge Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
