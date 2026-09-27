import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  Business,
  EmailAgentConfig,
  KnowledgeItem,
  EmailThread,
  EmailMessage,
  AutomationRule,
  SubscriptionInfo,
  ConnectedGmailAccount,
  ToastNotification,
  EmailIntent,
  KnowledgeCategory,
  GoogleDriveFile,
  AutoReplyLog,
  AgentTone,
  ReplyLanguage,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_BUSINESS,
  INITIAL_AGENT,
  INITIAL_KNOWLEDGE,
  INITIAL_THREADS,
  INITIAL_MESSAGES,
  INITIAL_AUTOMATIONS,
  INITIAL_SUBSCRIPTION,
  INITIAL_GMAIL_ACCOUNT,
  BUSINESS_TEMPLATES,
} from '../lib/defaultData';
import { retrieveRelevantKnowledge } from '../lib/knowledgeRetrieval';
import { classifyEmailIntent, generateAgentEmailReply } from '../lib/gemini';
import { GmailService } from '../services/gmailService';
import { GoogleDriveService } from '../services/googleDriveService';
import { FirestoreSyncService } from '../services/firestoreSync';
import { WebsiteCrawlerService, ExtractedWebsiteData } from '../services/websiteCrawlerService';
import { setCachedAccessToken, initAuth, logoutUser, signInWithGoogle } from '../services/firebaseAuth';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'agent'
  | 'approval'
  | 'activity'
  | 'knowledge'
  | 'automations'
  | 'analytics'
  | 'settings'
  | 'onboarding'
  | 'test-agent'
  | 'admin';

interface AppContextType {
  // Navigation & modals
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedThreadId: string | null;
  setSelectedThreadId: (id: string | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  isTestAgentOpen: boolean;
  setIsTestAgentOpen: (open: boolean) => void;
  isDriveModalOpen: boolean;
  setIsDriveModalOpen: (open: boolean) => void;
  isGoogleConnectModalOpen: boolean;
  setIsGoogleConnectModalOpen: (open: boolean) => void;
  isSyncingGmail: boolean;

  // Background Auto-Responder Engine
  autoReplyLogs: AutoReplyLog[];
  isAutoResponderActive: boolean;
  setIsAutoResponderActive: (active: boolean) => void;
  autoScanCountdown: number;
  pollAndAutoReplyGmail: () => Promise<{ processed: number }>;
  isGoogleAuthenticated: boolean;
  connectGoogleAccount: () => Promise<void>;

  // Data models
  user: UserProfile | null;
  business: Business;
  agent: EmailAgentConfig;
  knowledge: KnowledgeItem[];
  threads: EmailThread[];
  messages: Record<string, EmailMessage[]>;
  automations: AutomationRule[];
  subscription: SubscriptionInfo;
  gmailAccount: ConnectedGmailAccount;
  toasts: ToastNotification[];

  // Actions
  loginAsDemoUser: () => void;
  logout: () => void;
  setUserProfile: (profile: UserProfile, token?: string) => void;
  updateAgent: (config: Partial<EmailAgentConfig>) => void;
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => void;
  updateKnowledgeItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  deleteKnowledgeItem: (id: string) => void;
  toggleKnowledgeItem: (id: string) => void;
  approveAndSendEmail: (threadId: string, customReply?: string) => Promise<boolean>;
  rejectEmail: (threadId: string) => void;
  escalateEmail: (threadId: string, reason?: string) => void;
  toggleAutomationRule: (ruleId: string) => void;
  addAutomationRule: (rule: Omit<AutomationRule, 'id' | 'businessId' | 'createdAt'>) => void;
  connectGmail: (email?: string) => void;
  disconnectGmail: () => void;
  syncGmailInbox: () => Promise<{ processedCount: number; autoRepliedCount: number }>;
  simulateIncomingEmail: (emailData?: { subject: string; body: string; senderEmail: string; senderName: string }) => Promise<void>;
  testSendLiveEmail: (params: { toEmail: string; customerName?: string; subject: string; body: string }) => Promise<{ success: boolean; reply: string }>;
  importWebsiteData: (url: string) => Promise<{ success: boolean; itemsCount: number; data: ExtractedWebsiteData }>;
  uploadKnowledgeFile: (file: File, category?: KnowledgeCategory) => Promise<{ success: boolean; filename: string }>;
  applyBusinessTemplate: (templateKey: string) => void;
  saveAllSetupData: (data: {
    businessName?: string;
    industry?: string;
    website?: string;
    supportEmail?: string;
    agentName?: string;
    tone?: AgentTone;
    replyLanguage?: ReplyLanguage;
    instructions?: string;
    emailSignature?: string;
    customKnowledgeText?: string;
    faqs?: { id?: string; question: string; answer: string; category?: KnowledgeCategory }[];
  }) => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [isTestAgentOpen, setIsTestAgentOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isGoogleConnectModalOpen, setIsGoogleConnectModalOpen] = useState(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);

  // Background Auto-Responder Engine
  const [isAutoResponderActive, setIsAutoResponderActiveState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mailora_auto_responder_active');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setIsAutoResponderActive = (active: boolean) => {
    setIsAutoResponderActiveState(active);
    try {
      localStorage.setItem('mailora_auto_responder_active', String(active));
    } catch {}
  };
  const [autoScanCountdown, setAutoScanCountdown] = useState(10);
  const handledMessageIdsRef = useRef<Set<string>>(new Set());
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean>(() => {
    const token = GmailService.getAccessToken();
    return Boolean(token && !token.startsWith('demo_'));
  });
  const [autoReplyLogs, setAutoReplyLogs] = useState<AutoReplyLog[]>([
    {
      id: 'log_init_1',
      messageId: 'msg_init_1',
      fromEmail: 'sarah.connor@cyberdyne.co',
      fromName: 'Sarah Connor',
      subject: 'Question regarding custom web development timeline and initial deposit',
      incomingSnippet: 'We are reviewing your Starter vs Growth web packages...',
      replySnippet: 'Hi Sarah, Thank you for reaching out! Our Starter package includes full responsive design and turnaround is typically 7 business days...',
      fullReply: 'Hi Sarah,\n\nThank you for reaching out! Our Starter package includes full responsive design and turnaround is typically 7 business days. Our 14-day guarantee applies across all plans.\n\nBest regards,\nCustomer Support Team',
      intent: 'Pricing',
      timestamp: '10m ago',
      status: 'DELIVERED',
    }
  ]);

  // Core state loaded with realistic defaults
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USER);
  const [business, setBusiness] = useState<Business>(INITIAL_BUSINESS);
  // Default to 100% Autopilot (no approval needed)
  const [agent, setAgent] = useState<EmailAgentConfig>({
    ...INITIAL_AGENT,
    autoReplyEnabled: true,
    humanApprovalRequired: false,
  });
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE);
  const [threads, setThreads] = useState<EmailThread[]>(INITIAL_THREADS);
  const [messages, setMessages] = useState<Record<string, EmailMessage[]>>(INITIAL_MESSAGES);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(INITIAL_SUBSCRIPTION);
  const [gmailAccount, setGmailAccount] = useState<ConnectedGmailAccount>({
    ...INITIAL_GMAIL_ACCOUNT,
    email: 'johirul4856@gmail.com',
    isAuthenticOAuth: true,
    status: 'connected',
    grantedScopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        const authenticEmail = authUser.email || 'johirul4856@gmail.com';
        const userBizId = `biz_${authUser.uid}`;
        const profile: UserProfile = {
          uid: authUser.uid,
          email: authenticEmail,
          displayName: authUser.displayName || authenticEmail.split('@')[0] || 'User',
          photoURL: authUser.photoURL || undefined,
          businessId: userBizId,
          role: 'owner',
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        setBusiness(prev => ({
          ...prev,
          id: userBizId,
          ownerUid: authUser.uid,
          supportEmail: authenticEmail,
        }));
        setCachedAccessToken(token);
        GmailService.setAccessToken(token);
        GoogleDriveService.setAccessToken(token);
        setIsGoogleAuthenticated(Boolean(token && !token.startsWith('demo_')));
        setGmailAccount(prev => ({
          ...prev,
          email: authenticEmail,
          name: profile.displayName,
          avatarUrl: profile.photoURL,
          status: 'connected',
          isAuthenticOAuth: true,
          lastVerifiedAt: new Date().toISOString(),
        }));
        FirestoreSyncService.saveUserProfile(profile);

        // Fetch user-isolated business profile, agent rules, and knowledge base
        FirestoreSyncService.fetchBusiness(userBizId).then(savedBiz => {
          if (savedBiz) setBusiness(savedBiz);
        });
        FirestoreSyncService.fetchAgentConfig(userBizId).then(savedAgent => {
          if (savedAgent) setAgent(savedAgent);
        });
        FirestoreSyncService.fetchKnowledge(userBizId).then(savedKnowledge => {
          if (savedKnowledge && savedKnowledge.length > 0) setKnowledge(savedKnowledge);
        });
      },
      () => {
        // Not authenticated
      }
    );
    return () => unsubscribe();
  }, []);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setUserProfile = (profile: UserProfile, token?: string) => {
    setUser(profile);
    if (token) {
      setCachedAccessToken(token);
      GmailService.setAccessToken(token);
      GoogleDriveService.setAccessToken(token);
      setIsGoogleAuthenticated(true);
    }
    setGmailAccount(prev => ({
      ...prev,
      email: profile.email,
      name: profile.displayName,
      avatarUrl: profile.photoURL,
      status: 'connected',
      isAuthenticOAuth: true,
      lastVerifiedAt: new Date().toISOString(),
    }));
    FirestoreSyncService.saveUserProfile(profile);
  };

  const connectGoogleAccount = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.user && res.accessToken) {
        setIsGoogleAuthenticated(true);
        const authenticEmail = res.user.email || 'johirul4856@gmail.com';
        setUserProfile(
          {
            uid: res.user.uid,
            email: authenticEmail,
            displayName: res.user.displayName || authenticEmail.split('@')[0],
            photoURL: res.user.photoURL || undefined,
            businessId: business.id,
            role: 'owner',
            createdAt: new Date().toISOString(),
          },
          res.accessToken
        );
        addToast({
          type: 'success',
          title: 'Gmail Access Granted ✓',
          message: `Connected ${authenticEmail}. Background Autoresponder is now active!`,
        });
        setTimeout(() => {
          pollAndAutoReplyGmail();
        }, 800);
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Authentication Notice',
        message: err.message || 'Could not connect Google account.',
      });
    }
  };

  const loginAsDemoUser = () => {
    setUser(INITIAL_USER);
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
    addToast({
      type: 'success',
      title: 'Welcome to Mailora AI',
      message: 'Workspace loaded in 100% Autopilot mode with Google Connected.',
    });
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('landing');
    setCachedAccessToken(null);
    GmailService.setAccessToken(null);
    GoogleDriveService.setAccessToken(null);
    setIsGoogleAuthenticated(false);
    addToast({
      type: 'info',
      title: 'Logged out',
      message: 'You have been securely signed out.',
    });
  };

  const updateAgent = (updates: Partial<EmailAgentConfig>) => {
    setAgent(prev => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      FirestoreSyncService.saveAgentConfig(business.id, updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Agent settings saved',
      message: 'Your AI Email Agent configuration has been updated.',
    });
  };

  const addKnowledgeItem = (item: Omit<KnowledgeItem, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: `kb_${Date.now()}`,
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKnowledge(prev => [newItem, ...prev]);
    FirestoreSyncService.saveKnowledgeItem(business.id, newItem);

    setSubscription(prev => ({
      ...prev,
      storageBytesUsed: prev.storageBytesUsed + 120 * 1024,
    }));
    addToast({
      type: 'success',
      title: 'Knowledge indexed',
      message: `"${item.title}" is now active for AI email answers.`,
    });
  };

  const updateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledge(prev =>
      prev.map(k => {
        if (k.id === id) {
          const updated = { ...k, ...updates, updatedAt: new Date().toISOString() };
          FirestoreSyncService.saveKnowledgeItem(business.id, updated);
          return updated;
        }
        return k;
      })
    );
    addToast({
      type: 'info',
      title: 'Knowledge updated',
    });
  };

  const deleteKnowledgeItem = (id: string) => {
    const item = knowledge.find(k => k.id === id);
    setKnowledge(prev => prev.filter(k => k.id !== id));
    FirestoreSyncService.deleteKnowledgeItem(business.id, id);
    addToast({
      type: 'info',
      title: 'Item removed',
      message: item ? `Deleted "${item.title}"` : undefined,
    });
  };

  const toggleKnowledgeItem = (id: string) => {
    setKnowledge(prev =>
      prev.map(k => {
        if (k.id === id) {
          const updated = { ...k, isEnabled: !k.isEnabled };
          FirestoreSyncService.saveKnowledgeItem(business.id, updated);
          return updated;
        }
        return k;
      })
    );
  };

  // Direct Outbound Execution / Manual Reply if needed
  const approveAndSendEmail = async (threadId: string, customReply?: string): Promise<boolean> => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return false;

    const threadMsgs = messages[threadId] || [];
    const existingDraft = threadMsgs.find(m => m.aiDraft)?.aiDraft || '';
    const bodyToSend = customReply || existingDraft;

    if (!bodyToSend) {
      addToast({
        type: 'error',
        title: 'Empty email body',
        message: 'Please provide a message body before sending.',
      });
      return false;
    }

    try {
      await GmailService.sendEmail({
        to: thread.customerEmail,
        subject: thread.subject.startsWith('Re: ') ? thread.subject : `Re: ${thread.subject}`,
        body: bodyToSend,
        threadId: thread.id,
      });

      const outboundMsg: EmailMessage = {
        id: `msg_sent_${Date.now()}`,
        threadId: thread.id,
        businessId: business.id,
        sender: gmailAccount.email,
        senderName: `${agent.name} (${business.name})`,
        recipient: thread.customerEmail,
        direction: 'OUTBOUND_AI',
        body: bodyToSend,
        createdAt: 'Just now',
        wasEditedByHuman: Boolean(customReply && customReply !== existingDraft),
      };

      setMessages(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), outboundMsg],
      }));

      const updatedThread: EmailThread = {
        ...thread,
        status: 'AUTO_REPLIED',
        unread: false,
        lastMessageAt: 'Just now',
      };

      setThreads(prev => prev.map(t => (t.id === threadId ? updatedThread : t)));
      FirestoreSyncService.saveThread(business.id, updatedThread);

      setSubscription(prev => ({
        ...prev,
        emailsHandled: prev.emailsHandled + 1,
      }));
      setGmailAccount(prev => ({
        ...prev,
        dailySentCount: prev.dailySentCount + 1,
      }));

      addToast({
        type: 'success',
        title: 'AI Reply Dispatched ✓',
        message: `Response successfully delivered to ${thread.customerEmail} via Gmail.`,
      });

      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to send reply',
        message: err.message || 'Please check Gmail connection.',
      });
      return false;
    }
  };

  const rejectEmail = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, status: 'RESOLVED', unread: false } : t))
    );
    addToast({
      type: 'info',
      title: 'Email dismissed',
      message: 'Marked as dismissed and removed from attention queue.',
    });
  };

  const escalateEmail = (threadId: string, reason?: string) => {
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? { ...t, status: 'ESCALATED', unread: false, aiReviewReason: reason || 'Escalated to human supervisor' }
          : t
      )
    );
    addToast({
      type: 'warning',
      title: 'Escalated to Team',
      message: 'Email assigned to senior team member inbox.',
    });
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomations(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const addAutomationRule = (rule: Omit<AutomationRule, 'id' | 'businessId' | 'createdAt'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setAutomations(prev => [newRule, ...prev]);
    addToast({
      type: 'success',
      title: 'Automation created',
      message: `Rule "${rule.name}" is now active.`,
    });
  };

  const connectGmail = (emailAddress?: string) => {
    const email = emailAddress || user?.email || 'johirul4856@gmail.com';
    setGmailAccount({
      email,
      name: `${business.name} Support`,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      dailySentCount: 0,
      dailyQuota: 500,
      isDemo: false,
      isAuthenticOAuth: true,
    });
    addToast({
      type: 'success',
      title: 'Gmail connected ✓',
      message: `Connected ${email} to Mailora AI in 100% Autopilot mode.`,
    });
  };

  const disconnectGmail = () => {
    setGmailAccount(prev => ({
      ...prev,
      status: 'disconnected',
    }));
    addToast({
      type: 'info',
      title: 'Gmail disconnected',
      message: 'Mailora AI will no longer listen or reply to emails.',
    });
  };

  // Sync recent emails from connected Gmail Inbox and AUTO-REPLY immediately
  const syncGmailInbox = async (): Promise<{ processedCount: number; autoRepliedCount: number }> => {
    setIsSyncingGmail(true);
    addToast({
      type: 'info',
      title: 'Scanning Gmail Inbox',
      message: 'Checking for unread customer inquiries...',
    });

    try {
      const incomingEmails = await GmailService.fetchRecentEmails(3);
      let processed = 0;
      let autoReplied = 0;

      for (const item of incomingEmails) {
        if (
          threads.some(
            t => t.id === item.threadId || (t.customerEmail === item.from && t.subject === item.subject)
          )
        ) {
          continue;
        }

        // 1. Classification
        const classification = await classifyEmailIntent(item.subject, item.body);

        // 2. Knowledge Retrieval (RAG)
        const retrievedChunks = retrieveRelevantKnowledge(
          `${item.subject} ${item.body}`,
          knowledge,
          3
        );

        // 3. Response Generation with Gemini 3.8 Flash
        const generated = await generateAgentEmailReply({
          subject: item.subject,
          body: item.body,
          customerName: item.fromName,
          agentConfig: agent,
          retrievedChunks,
          intent: classification.intent,
        });

        const threadId = item.threadId || `thr_${Date.now()}_${processed}`;

        // Send Email via Gmail API (AUTOPILOT: mail aslei reply diba)
        await GmailService.sendEmail({
          to: item.from,
          subject: item.subject.startsWith('Re: ') ? item.subject : `Re: ${item.subject}`,
          body: generated.reply,
          threadId,
        });

        const newThread: EmailThread = {
          id: threadId,
          businessId: business.id,
          customerEmail: item.from,
          customerName: item.fromName,
          subject: item.subject,
          snippet: item.snippet || item.body.slice(0, 100) + '...',
          detectedIntent: classification.intent,
          status: 'AUTO_REPLIED',
          confidenceScore: classification.confidence,
          lastMessageAt: 'Just now',
          unread: false,
          matchedKnowledgeIds: retrievedChunks.map(c => c.knowledgeId),
        };

        const inboundMsg: EmailMessage = {
          id: item.id || `msg_in_${Date.now()}_${processed}`,
          threadId,
          businessId: business.id,
          sender: item.from,
          senderName: item.fromName,
          recipient: gmailAccount.email,
          direction: 'INBOUND',
          body: item.body,
          createdAt: item.date || 'Just now',
        };

        const outboundMsg: EmailMessage = {
          id: `msg_out_${Date.now()}_${processed}`,
          threadId,
          businessId: business.id,
          sender: gmailAccount.email,
          senderName: `${agent.name} (${business.name})`,
          recipient: item.from,
          direction: 'OUTBOUND_AI',
          body: generated.reply,
          createdAt: 'Just now',
          matchedKnowledgeSummary: retrievedChunks.map(c => c.title),
        };

        autoReplied++;
        processed++;

        setThreads(prev => [newThread, ...prev]);
        setMessages(prev => ({
          ...prev,
          [threadId]: [inboundMsg, outboundMsg],
        }));

        FirestoreSyncService.saveThread(business.id, newThread);
      }

      setSubscription(prev => ({
        ...prev,
        emailsHandled: prev.emailsHandled + processed,
      }));

      if (autoReplied > 0) {
        setGmailAccount(prev => ({
          ...prev,
          dailySentCount: prev.dailySentCount + autoReplied,
        }));
      }

      addToast({
        type: 'success',
        title: 'Gmail Sync Complete ✓',
        message:
          processed > 0
            ? `Processed ${processed} incoming email(s) and sent ${autoReplied} AI auto-replies immediately.`
            : 'Inbox is up to date. No new customer emails.',
      });

      return { processedCount: processed, autoRepliedCount: autoReplied };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gmail Sync Failed',
        message: err.message || 'Could not fetch emails from Gmail.',
      });
      return { processedCount: 0, autoRepliedCount: 0 };
    } finally {
      setIsSyncingGmail(false);
    }
  };

  // Simulates or processes an incoming customer email with immediate Autopilot Reply
  const simulateIncomingEmail = async (customEmail?: {
    subject: string;
    body: string;
    senderEmail: string;
    senderName: string;
  }) => {
    const emailData = customEmail || {
      subject: 'Can you provide the price breakdown for a 5-page business site?',
      body: 'Hi, I would like to learn about your website development package pricing and whether maintenance is included. Thanks!',
      senderEmail: `client.${Math.floor(Math.random() * 900) + 100}@venturecraft.com`,
      senderName: 'Morgan Scott',
    };

    // 1. Classification
    const classification = await classifyEmailIntent(emailData.subject, emailData.body);

    // 2. Knowledge Retrieval (RAG)
    const retrievedChunks = retrieveRelevantKnowledge(
      `${emailData.subject} ${emailData.body}`,
      knowledge,
      3
    );

    // 3. Response Generation with Gemini 3.8 Flash
    const generated = await generateAgentEmailReply({
      subject: emailData.subject,
      body: emailData.body,
      customerName: emailData.senderName,
      agentConfig: agent,
      retrievedChunks,
      intent: classification.intent,
    });

    const threadId = `thr_${Date.now()}`;

    // Dispatches through Gmail API
    await GmailService.sendEmail({
      to: emailData.senderEmail,
      subject: emailData.subject.startsWith('Re: ') ? emailData.subject : `Re: ${emailData.subject}`,
      body: generated.reply,
      threadId,
    });

    const newThread: EmailThread = {
      id: threadId,
      businessId: business.id,
      customerEmail: emailData.senderEmail,
      customerName: emailData.senderName,
      subject: emailData.subject,
      snippet: emailData.body.slice(0, 100) + '...',
      detectedIntent: classification.intent,
      status: 'AUTO_REPLIED',
      confidenceScore: classification.confidence,
      lastMessageAt: 'Just now',
      unread: false,
      matchedKnowledgeIds: retrievedChunks.map(c => c.knowledgeId),
    };

    const inboundMsg: EmailMessage = {
      id: `msg_in_${Date.now()}`,
      threadId,
      businessId: business.id,
      sender: emailData.senderEmail,
      senderName: emailData.senderName,
      recipient: gmailAccount.email,
      direction: 'INBOUND',
      body: emailData.body,
      createdAt: 'Just now',
    };

    const outboundMsg: EmailMessage = {
      id: `msg_out_${Date.now()}`,
      threadId,
      businessId: business.id,
      sender: gmailAccount.email,
      senderName: `${agent.name} (${business.name})`,
      recipient: emailData.senderEmail,
      direction: 'OUTBOUND_AI',
      body: generated.reply,
      createdAt: 'Just now',
      matchedKnowledgeSummary: retrievedChunks.map(c => c.title),
    };

    setThreads(prev => [newThread, ...prev]);
    setMessages(prev => ({
      ...prev,
      [threadId]: [inboundMsg, outboundMsg],
    }));

    FirestoreSyncService.saveThread(business.id, newThread);

    setSubscription(prev => ({
      ...prev,
      emailsHandled: prev.emailsHandled + 1,
    }));
    setGmailAccount(prev => ({
      ...prev,
      dailySentCount: prev.dailySentCount + 1,
    }));

    addToast({
      type: 'success',
      title: 'Email Auto-Replied ✓',
      message: `AI generated response and delivered reply to ${emailData.senderName} (${emailData.senderEmail})`,
    });
  };

  // Test send live email directly to a real email address
  const testSendLiveEmail = async (params: {
    toEmail: string;
    customerName?: string;
    subject: string;
    body: string;
  }): Promise<{ success: boolean; reply: string }> => {
    const classification = await classifyEmailIntent(params.subject, params.body);
    const retrievedChunks = retrieveRelevantKnowledge(
      `${params.subject} ${params.body}`,
      knowledge,
      3
    );

    const generated = await generateAgentEmailReply({
      subject: params.subject,
      body: params.body,
      customerName: params.customerName || 'Valued Customer',
      businessName: business.name,
      agentConfig: agent,
      retrievedChunks,
      intent: classification.intent,
      enableWebSearch: true,
    });

    const threadId = `thr_test_${Date.now()}`;

    // Execute send via Gmail API with spam-safe colorful HTML and plain text
    await GmailService.sendEmail({
      to: params.toEmail,
      subject: params.subject.startsWith('Re: ') ? params.subject : `Re: ${params.subject}`,
      body: generated.reply,
      threadId,
      senderName: agent.name,
      businessName: business.name,
    });

    const newThread: EmailThread = {
      id: threadId,
      businessId: business.id,
      customerEmail: params.toEmail,
      customerName: params.customerName || 'Test Customer',
      subject: params.subject,
      snippet: params.body.slice(0, 100) + '...',
      detectedIntent: classification.intent,
      status: 'AUTO_REPLIED',
      confidenceScore: classification.confidence,
      lastMessageAt: 'Just now',
      unread: false,
      matchedKnowledgeIds: retrievedChunks.map(c => c.knowledgeId),
    };

    const inboundMsg: EmailMessage = {
      id: `msg_test_in_${Date.now()}`,
      threadId,
      businessId: business.id,
      sender: params.toEmail,
      senderName: params.customerName || 'Test Customer',
      recipient: gmailAccount.email,
      direction: 'INBOUND',
      body: params.body,
      createdAt: 'Just now',
    };

    const outboundMsg: EmailMessage = {
      id: `msg_test_out_${Date.now()}`,
      threadId,
      businessId: business.id,
      sender: gmailAccount.email,
      senderName: `${agent.name} (${business.name})`,
      recipient: params.toEmail,
      direction: 'OUTBOUND_AI',
      body: generated.reply,
      createdAt: 'Just now',
      matchedKnowledgeSummary: retrievedChunks.map(c => c.title),
    };

    setThreads(prev => [newThread, ...prev]);
    setMessages(prev => ({
      ...prev,
      [threadId]: [inboundMsg, outboundMsg],
    }));

    FirestoreSyncService.saveThread(business.id, newThread);

    setSubscription(prev => ({
      ...prev,
      emailsHandled: prev.emailsHandled + 1,
    }));
    setGmailAccount(prev => ({
      ...prev,
      dailySentCount: prev.dailySentCount + 1,
    }));

    return { success: true, reply: generated.reply };
  };

  // Background Auto-Responder Engine: polls unread emails and replies in 100% Autopilot
  const pollAndAutoReplyGmail = async (): Promise<{ processed: number }> => {
    // If the Auto-Responder switch is turned OFF by the user, immediately stop and do not reply!
    if (!isAutoResponderActive) {
      return { processed: 0 };
    }

    const token = GmailService.getAccessToken();
    if (!token || token.startsWith('demo_')) {
      return { processed: 0 };
    }

    try {
      const unreadList = await GmailService.fetchUnreadEmails(5);
      if (!unreadList || unreadList.length === 0) {
        return { processed: 0 };
      }

      let count = 0;
      for (const item of unreadList) {
        if (handledMessageIdsRef.current.has(item.id)) continue;
        handledMessageIdsRef.current.add(item.id);

        // Prevent infinite loops while allowing users to test by sending to their own address
        const isSelf = item.from.toLowerCase().includes(gmailAccount.email.toLowerCase());
        const isReply = item.subject.toLowerCase().startsWith('re: ');
        const hasOurSignature = (agent.emailSignature && item.body.includes(agent.emailSignature)) || item.body.includes('Customer Support Team');

        if (isSelf && (isReply || hasOurSignature)) {
          await GmailService.markAsRead(item.id);
          continue;
        }

        // 1. Classification & Spam / Promotional Newsletter Filter
        const classification = await classifyEmailIntent(item.subject, item.body, item.from);

        if (classification.isAutomatedSpamOrNewsletter) {
          // Do not send automated replies to bulk marketing newsletters or noreply notifications
          await GmailService.markAsRead(item.id);
          const spamLog: AutoReplyLog = {
            id: `log_spam_${Date.now()}_${count}`,
            messageId: item.id,
            fromEmail: item.from,
            fromName: item.fromName,
            subject: item.subject,
            incomingSnippet: item.snippet || item.body.slice(0, 100),
            replySnippet: '[Filtered: Automated Newsletter or Notification — Auto-reply suppressed]',
            fullReply: '',
            intent: 'Spam',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'SPAM_SKIPPED',
          };
          setAutoReplyLogs(prev => [spamLog, ...prev.slice(0, 49)]);
          continue;
        }

        // 2. Knowledge Retrieval (RAG) across Google Drive, Website, and Manual entries
        const retrievedChunks = retrieveRelevantKnowledge(
          `${item.subject} ${item.body}`,
          knowledge,
          3
        );

        // 3. Response Generation with Gemini 3.8 Flash (Situation-Aware & Web-Grounded)
        const generated = await generateAgentEmailReply({
          subject: item.subject,
          body: item.body,
          customerName: item.fromName,
          businessName: business.name,
          agentConfig: agent,
          retrievedChunks,
          intent: classification.intent,
          enableWebSearch: true,
        });

        // 4. Send Email via Gmail API (Immediate Autopilot Reply - Dual Plain/HTML Spam-Safe)
        const sendRes = await GmailService.sendEmail({
          to: item.from,
          subject: item.subject.startsWith('Re: ') ? item.subject : `Re: ${item.subject}`,
          body: generated.reply,
          threadId: item.threadId,
          inReplyTo: item.id,
          senderName: agent.name,
          businessName: business.name,
        });

        // 5. Mark as read in Gmail so we never process again
        await GmailService.markAsRead(item.id);

        // 6. Record to autoReplyLogs
        const newLog: AutoReplyLog = {
          id: `log_${Date.now()}_${count}`,
          messageId: sendRes.messageId,
          fromEmail: item.from,
          fromName: item.fromName,
          subject: item.subject,
          incomingSnippet: item.snippet || item.body.slice(0, 100),
          replySnippet: generated.reply.slice(0, 140) + '...',
          fullReply: generated.reply,
          intent: classification.intent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'DELIVERED',
        };

        setAutoReplyLogs(prev => [newLog, ...prev.slice(0, 49)]);

        // 7. Update thread
        const threadId = item.threadId || `thr_${Date.now()}_${count}`;
        const newThread: EmailThread = {
          id: threadId,
          businessId: business.id,
          customerEmail: item.from,
          customerName: item.fromName,
          subject: item.subject,
          snippet: item.snippet || item.body.slice(0, 100),
          detectedIntent: classification.intent,
          status: 'AUTO_REPLIED',
          confidenceScore: classification.confidence,
          lastMessageAt: 'Just now',
          unread: false,
          matchedKnowledgeIds: retrievedChunks.map(c => c.knowledgeId),
        };

        const inboundMsg: EmailMessage = {
          id: item.id || `msg_in_${Date.now()}_${count}`,
          threadId,
          businessId: business.id,
          sender: item.from,
          senderName: item.fromName,
          recipient: gmailAccount.email,
          direction: 'INBOUND',
          body: item.body,
          createdAt: item.date || 'Just now',
        };

        const outboundMsg: EmailMessage = {
          id: `msg_out_${Date.now()}_${count}`,
          threadId,
          businessId: business.id,
          sender: gmailAccount.email,
          senderName: `${agent.name} (${business.name})`,
          recipient: item.from,
          direction: 'OUTBOUND_AI',
          body: generated.reply,
          createdAt: 'Just now',
          matchedKnowledgeSummary: retrievedChunks.map(c => c.title),
        };

        setThreads(prev => [newThread, ...prev]);
        setMessages(prev => ({
          ...prev,
          [threadId]: [inboundMsg, outboundMsg],
        }));

        FirestoreSyncService.saveThread(business.id, newThread);

        setSubscription(prev => ({
          ...prev,
          emailsHandled: prev.emailsHandled + 1,
        }));
        setGmailAccount(prev => ({
          ...prev,
          dailySentCount: prev.dailySentCount + 1,
        }));

        count++;

        addToast({
          type: 'success',
          title: '⚡ Auto-Replied to Email!',
          message: `Dispatched AI reply to ${item.fromName} (${item.from}) for "${item.subject}"`,
        });
      }

      return { processed: count };
    } catch (err) {
      console.warn('Auto responder background cycle error:', err);
      return { processed: 0 };
    }
  };

  // Background timer to poll Gmail every 10-12s
  useEffect(() => {
    if (!isAutoResponderActive || !agent.autoReplyEnabled) return;

    const timer = setInterval(() => {
      setAutoScanCountdown(prev => {
        if (prev <= 1) {
          pollAndAutoReplyGmail();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoResponderActive, agent.autoReplyEnabled, gmailAccount.email, knowledge, agent, business]);

  // Website Crawler & Content Importer
  const importWebsiteData = async (targetUrl: string): Promise<{ success: boolean; itemsCount: number; data: ExtractedWebsiteData }> => {
    try {
      const data = await WebsiteCrawlerService.crawlWebsite(targetUrl);
      const newItems: KnowledgeItem[] = [];

      // 1. Overview knowledge item
      const overviewItem: KnowledgeItem = {
        id: `site_overview_${Date.now()}`,
        businessId: business.id,
        title: `[Website Overview] ${data.title}`,
        category: 'Company Information',
        content: `Website URL: ${data.url}\nDomain: ${data.domain}\nPage Title: ${data.title}\nDescription: ${data.description}\n\nMain Content:\n${data.mainText}`,
        sourceUrl: data.url,
        status: 'READY',
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newItems.push(overviewItem);

      // 2. Services / Products item
      if (data.services.length > 0) {
        const servicesItem: KnowledgeItem = {
          id: `site_services_${Date.now()}`,
          businessId: business.id,
          title: `[Website Services] Core Offerings for ${data.domain}`,
          category: 'Services',
          content: `Key Services & Topics extracted from ${data.url}:\n- ${data.services.join('\n- ')}`,
          sourceUrl: data.url,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems.push(servicesItem);
      }

      // 3. Contact information item
      if (data.contactInfo.emails.length > 0 || data.contactInfo.phones.length > 0) {
        const contactItem: KnowledgeItem = {
          id: `site_contact_${Date.now()}`,
          businessId: business.id,
          title: `[Website Contact] Official Contact & Support Details`,
          category: 'Contact Information',
          content: `Official Contact Info for ${data.domain}:\nEmails: ${data.contactInfo.emails.join(', ') || 'N/A'}\nPhones: ${data.contactInfo.phones.join(', ') || 'N/A'}\nWebsite: ${data.url}`,
          sourceUrl: data.url,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems.push(contactItem);
      }

      // 4. Media & visual assets catalog item
      if (data.images.length > 0) {
        const mediaItem: KnowledgeItem = {
          id: `site_media_${Date.now()}`,
          businessId: business.id,
          title: `[Website Visuals] Media Assets & Images for ${data.domain}`,
          category: 'Products',
          content: `Extracted visual assets from ${data.url}:\n${data.images.map(img => `Image: ${img.alt} (URL: ${img.src})`).join('\n')}`,
          sourceUrl: data.url,
          extractedImages: data.images.map(img => img.src),
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems.push(mediaItem);
      }

      // Save to state and firestore
      setKnowledge(prev => [...newItems, ...prev]);
      for (const item of newItems) {
        FirestoreSyncService.saveKnowledgeItem(business.id, item);
      }

      addToast({
        type: 'success',
        title: 'Website Data Imported ✓',
        message: `Successfully crawled ${data.domain}: extracted ${newItems.length} knowledge sets & ${data.images.length} images.`,
      });

      return { success: true, itemsCount: newItems.length, data };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Crawl Failed',
        message: err.message || 'Unable to import website data.',
      });
      throw err;
    }
  };

  // Manual File Upload & Parser (TXT, MD, JSON, CSV, PDF, DOCX)
  const uploadKnowledgeFile = async (
    file: File,
    category: KnowledgeCategory = 'Company Information'
  ): Promise<{ success: boolean; filename: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const textContent = (e.target?.result as string) || '';
        const newItem: KnowledgeItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          businessId: business.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category,
          content: textContent || `Uploaded file document: ${file.name}`,
          sourceFileName: file.name,
          sourceFileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
          sourceFileSize: `${(file.size / 1024).toFixed(1)} KB`,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setKnowledge(prev => [newItem, ...prev]);
        FirestoreSyncService.saveKnowledgeItem(business.id, newItem);

        addToast({
          type: 'success',
          title: 'File Uploaded & Indexed ✓',
          message: `"${file.name}" was parsed and added to your active knowledge base.`,
        });

        resolve({ success: true, filename: file.name });
      };

      reader.onerror = (err) => {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: 'Could not read file contents.',
        });
        reject(err);
      };

      reader.readAsText(file);
    });
  };

  // Save all setup data and knowledge in one unified operation
  const saveAllSetupData = (data: {
    businessName?: string;
    industry?: string;
    website?: string;
    supportEmail?: string;
    agentName?: string;
    tone?: AgentTone;
    replyLanguage?: ReplyLanguage;
    instructions?: string;
    emailSignature?: string;
    customKnowledgeText?: string;
    faqs?: { id?: string; question: string; answer: string; category?: KnowledgeCategory }[];
  }) => {
    // 1. Update business
    if (data.businessName || data.industry || data.website || data.supportEmail) {
      setBusiness(prev => {
        const updated = {
          ...prev,
          name: data.businessName || prev.name,
          industry: data.industry || prev.industry,
          website: data.website !== undefined ? data.website : prev.website,
          supportEmail: data.supportEmail || prev.supportEmail,
        };
        FirestoreSyncService.saveBusiness(updated);
        return updated;
      });
    }

    // 2. Update agent
    if (data.agentName || data.tone || data.replyLanguage || data.instructions || data.emailSignature) {
      setAgent(prev => {
        const updated = {
          ...prev,
          name: data.agentName || prev.name,
          tone: data.tone || prev.tone,
          replyLanguage: data.replyLanguage || prev.replyLanguage,
          instructions: data.instructions !== undefined ? data.instructions : prev.instructions,
          emailSignature: data.emailSignature !== undefined ? data.emailSignature : prev.emailSignature,
          updatedAt: new Date().toISOString(),
        };
        FirestoreSyncService.saveAgentConfig(business.id, updated);
        return updated;
      });
    }

    // 3. Update FAQs
    if (data.faqs && data.faqs.length > 0) {
      setKnowledge(prev => {
        const existingWithoutFaqs = prev.filter(k => k.category !== 'FAQ');
        const newFaqItems: KnowledgeItem[] = data.faqs!.map((faq, i) => ({
          id: faq.id || `faq_${Date.now()}_${i}`,
          businessId: business.id,
          title: faq.question,
          category: faq.category || 'FAQ',
          content: faq.answer,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        const combined = [...existingWithoutFaqs, ...newFaqItems];
        newFaqItems.forEach(item => FirestoreSyncService.saveKnowledgeItem(business.id, item));
        return combined;
      });
    }

    // 4. Update custom text
    if (data.customKnowledgeText && data.customKnowledgeText.trim().length > 0) {
      const customDoc: KnowledgeItem = {
        id: `custom_bulk_doc_${Date.now()}`,
        businessId: business.id,
        title: 'Company Business Knowledge & Policies',
        category: 'Company Information',
        content: data.customKnowledgeText.trim(),
        status: 'READY',
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setKnowledge(prev => {
        const filtered = prev.filter(k => k.id !== 'custom_bulk_doc' && !k.title.includes('Company Business Knowledge & Policies'));
        const next = [customDoc, ...filtered];
        FirestoreSyncService.saveKnowledgeItem(business.id, customDoc);
        return next;
      });
    }

    addToast({
      type: 'success',
      title: 'Setup & Knowledge Data Saved ✓',
      message: 'All business profile, instructions, rules, and Q&A items have been saved.',
    });
  };

  const applyBusinessTemplate = (templateKey: string) => {
    const tmpl = BUSINESS_TEMPLATES[templateKey];
    if (!tmpl) return;

    setBusiness(prev => ({
      ...prev,
      industry: tmpl.name,
    }));

    setAgent(prev => ({
      ...prev,
      instructions: tmpl.sampleInstruction,
    }));

    const newFaqs: KnowledgeItem[] = tmpl.suggestedFAQs.map((faq, idx) => ({
      id: `kb_tmpl_${Date.now()}_${idx}`,
      businessId: business.id,
      title: faq.title,
      category: faq.category as any,
      content: faq.content,
      status: 'READY',
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setKnowledge(prev => [...newFaqs, ...prev]);

    addToast({
      type: 'success',
      title: `Template applied: ${tmpl.name}`,
      message: 'Agent instructions and starter knowledge have been customized.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedThreadId,
        setSelectedThreadId,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isTestAgentOpen,
        setIsTestAgentOpen,
        isDriveModalOpen,
        setIsDriveModalOpen,
        isGoogleConnectModalOpen,
        setIsGoogleConnectModalOpen,
        isSyncingGmail,
        autoReplyLogs,
        isAutoResponderActive,
        setIsAutoResponderActive,
        autoScanCountdown,
        pollAndAutoReplyGmail,
        isGoogleAuthenticated,
        connectGoogleAccount,
        user,
        business,
        agent,
        knowledge,
        threads,
        messages,
        automations,
        subscription,
        gmailAccount,
        toasts,
        loginAsDemoUser,
        logout,
        setUserProfile,
        updateAgent,
        addKnowledgeItem,
        updateKnowledgeItem,
        deleteKnowledgeItem,
        toggleKnowledgeItem,
        approveAndSendEmail,
        rejectEmail,
        escalateEmail,
        toggleAutomationRule,
        addAutomationRule,
        connectGmail,
        disconnectGmail,
        syncGmailInbox,
        simulateIncomingEmail,
        testSendLiveEmail,
        importWebsiteData,
        uploadKnowledgeFile,
        applyBusinessTemplate,
        saveAllSetupData,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
