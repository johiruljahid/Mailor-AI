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
  AutoReplyLog,
  AgentTone,
  ReplyLanguage,
  GoogleSheetsConfig,
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
import { GoogleSheetsService } from '../services/googleSheetsService';
import { GoogleDocsService } from '../services/googleDocsService';
import { FirestoreSyncService } from '../services/firestoreSync';
import { WebsiteCrawlerService, ExtractedWebsiteData } from '../services/websiteCrawlerService';
import { setCachedAccessToken, getCachedAccessToken, initAuth, logoutUser, signInWithGoogle } from '../services/firebaseAuth';

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

  // Google Sheets Activity Report
  googleSheetsConfig: GoogleSheetsConfig;
  connectGoogleSheet: (spreadsheetIdOrUrl?: string) => Promise<{ success: boolean; spreadsheetUrl: string }>;
  disconnectGoogleSheet: () => void;
  exportActivityToCsv: () => void;

  // Google Docs Integration
  importGoogleDoc: (docUrlOrId: string, category?: KnowledgeCategory) => Promise<{ success: boolean; title: string; docId: string }>;
  createGoogleDocKnowledge: (title: string, content: string, category?: KnowledgeCategory) => Promise<{ success: boolean; documentId: string; documentUrl: string }>;

  // Google Drive Integration
  connectGoogleDrive: () => Promise<boolean>;

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

// Helper for user-isolated local caching to guarantee persistence across logouts/logins
const getUserStorageKey = (uid: string) => `mailora_user_data_${uid}`;

const saveUserLocalData = (uid: string, data: any) => {
  try {
    const existing = JSON.parse(localStorage.getItem(getUserStorageKey(uid)) || '{}');
    localStorage.setItem(getUserStorageKey(uid), JSON.stringify({ ...existing, ...data }));
  } catch {}
};

const loadUserLocalData = (uid: string) => {
  try {
    const raw = localStorage.getItem(getUserStorageKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [isTestAgentOpen, setIsTestAgentOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isGoogleConnectModalOpen, setIsGoogleConnectModalOpen] = useState(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);

  // Background Auto-Responder Engine State
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
    const token = GmailService.getAccessToken() || getCachedAccessToken();
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
      replySnippet: 'Hi Sarah, Thank you for reaching out! Our Starter package turnaround is typically 7 business days...',
      fullReply: 'Hi Sarah,\n\nThank you for reaching out! Our Starter package turnaround is typically 7 business days. Our 14-day guarantee applies across all plans.\n\nBest regards,\nCustomer Support Team',
      intent: 'Pricing',
      timestamp: '10m ago',
      status: 'DELIVERED',
    },
  ]);

  // Google Sheets Activity Report Config
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>({
    isConnected: false,
    totalRowsLogged: 0,
    autoSyncEnabled: true,
  });

  // Core state loaded with realistic defaults
  const [user, setUser] = useState<UserProfile | null>(INITIAL_USER);
  const [business, setBusiness] = useState<Business>(INITIAL_BUSINESS);
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
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Listen to Firebase Auth state on mount & restore user data
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

        if (token) {
          setCachedAccessToken(token);
          GmailService.setAccessToken(token);
          GoogleDriveService.setAccessToken(token);
          GoogleSheetsService.setAccessToken(token);
          setIsGoogleAuthenticated(!token.startsWith('demo_'));
        }

        setGmailAccount(prev => ({
          ...prev,
          email: authenticEmail,
          name: profile.displayName,
          avatarUrl: profile.photoURL,
          status: 'connected',
          isAuthenticOAuth: true,
          lastVerifiedAt: new Date().toISOString(),
        }));

        // 1. Immediately restore user-isolated local state (instant restore upon login)
        const localData = loadUserLocalData(authUser.uid);
        if (localData) {
          if (localData.business) setBusiness(localData.business);
          if (localData.agent) setAgent(localData.agent);
          if (localData.knowledge && localData.knowledge.length > 0) setKnowledge(localData.knowledge);
          if (localData.autoReplyLogs && localData.autoReplyLogs.length > 0) setAutoReplyLogs(localData.autoReplyLogs);
          if (localData.googleSheetsConfig) setGoogleSheetsConfig(localData.googleSheetsConfig);
        }

        // 2. Ensure business workspace exists in Firestore with ownerUid
        const initialBizRecord: Business = {
          ...(localData?.business || INITIAL_BUSINESS),
          id: userBizId,
          ownerUid: authUser.uid,
          supportEmail: authenticEmail,
          updatedAt: new Date().toISOString(),
        };
        FirestoreSyncService.saveBusiness(initialBizRecord);
        FirestoreSyncService.saveUserProfile(profile);

        // 3. Fetch user-isolated business profile, agent rules, and knowledge base from Firestore
        FirestoreSyncService.fetchBusiness(userBizId).then(savedBiz => {
          if (savedBiz) {
            setBusiness(savedBiz);
            saveUserLocalData(authUser.uid, { business: savedBiz });
          }
        });
        FirestoreSyncService.fetchAgentConfig(userBizId).then(savedAgent => {
          if (savedAgent) {
            setAgent(savedAgent);
            saveUserLocalData(authUser.uid, { agent: savedAgent });
          }
        });
        FirestoreSyncService.fetchKnowledge(userBizId).then(savedKnowledge => {
          if (savedKnowledge && savedKnowledge.length > 0) {
            setKnowledge(savedKnowledge);
            saveUserLocalData(authUser.uid, { knowledge: savedKnowledge });
          }
        });
        FirestoreSyncService.fetchSheetsConfig(userBizId).then(savedSheets => {
          if (savedSheets) {
            setGoogleSheetsConfig(savedSheets);
            saveUserLocalData(authUser.uid, { googleSheetsConfig: savedSheets });
          }
        });
        FirestoreSyncService.fetchAutoReplyLogs(userBizId).then(savedLogs => {
          if (savedLogs && savedLogs.length > 0) {
            setAutoReplyLogs(savedLogs);
            saveUserLocalData(authUser.uid, { autoReplyLogs: savedLogs });
          }
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
      GoogleSheetsService.setAccessToken(token);
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
    if (profile.uid) {
      saveUserLocalData(profile.uid, { profile });
    }
  };

  const connectGoogleAccount = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.user && res.accessToken) {
        setIsGoogleAuthenticated(true);
        const authenticEmail = res.user.email || 'johirul4856@gmail.com';
        const userBizId = `biz_${res.user.uid}`;
        const newProfile: UserProfile = {
          uid: res.user.uid,
          email: authenticEmail,
          displayName: res.user.displayName || authenticEmail.split('@')[0],
          photoURL: res.user.photoURL || undefined,
          businessId: userBizId,
          role: 'owner',
          createdAt: new Date().toISOString(),
        };

        setUserProfile(newProfile, res.accessToken);

        // Ensure business record is persisted in Firestore
        const userBiz: Business = {
          ...business,
          id: userBizId,
          ownerUid: res.user.uid,
          supportEmail: authenticEmail,
          updatedAt: new Date().toISOString(),
        };
        setBusiness(userBiz);
        FirestoreSyncService.saveBusiness(userBiz);
        saveUserLocalData(res.user.uid, { business: userBiz });

        addToast({
          type: 'success',
          title: 'Google Workspace Connected ✓',
          message: `Connected ${authenticEmail}. Gmail auto-replies, Google Drive & Sheets are now active!`,
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

  const connectGoogleDrive = async (): Promise<boolean> => {
    try {
      const token = GmailService.getAccessToken() || getCachedAccessToken();
      if (!token) {
        await connectGoogleAccount();
      }
      setIsDriveModalOpen(true);
      return true;
    } catch {
      return false;
    }
  };

  // Connect Google Sheets for Live Email Activity Reports
  const connectGoogleSheet = async (spreadsheetIdOrUrl?: string): Promise<{ success: boolean; spreadsheetUrl: string }> => {
    try {
      let sheetId = '';
      let sheetUrl = '';

      if (spreadsheetIdOrUrl && spreadsheetIdOrUrl.trim().length > 0) {
        const input = spreadsheetIdOrUrl.trim();
        const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        sheetId = match ? match[1] : input;
        sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      } else {
        const created = await GoogleSheetsService.createReportSpreadsheet(
          `${business.name || 'Mailora AI'} - Email Activity & Client Report`
        );
        sheetId = created.spreadsheetId;
        sheetUrl = created.spreadsheetUrl;
      }

      const updatedConfig: GoogleSheetsConfig = {
        isConnected: true,
        spreadsheetId: sheetId,
        spreadsheetUrl: sheetUrl,
        spreadsheetTitle: `${business.name || 'Mailora AI'} - Email Activity Report`,
        sheetName: 'Email Activity Log',
        totalRowsLogged: autoReplyLogs.length,
        lastSyncedAt: new Date().toISOString(),
        autoSyncEnabled: true,
      };

      setGoogleSheetsConfig(updatedConfig);

      if (user?.uid) {
        saveUserLocalData(user.uid, { googleSheetsConfig: updatedConfig });
        FirestoreSyncService.saveSheetsConfig(`biz_${user.uid}`, updatedConfig);
      }

      addToast({
        type: 'success',
        title: 'Google Sheet Connected ✓',
        message: 'Live email activity will automatically log into your connected spreadsheet.',
      });

      return { success: true, spreadsheetUrl: sheetUrl };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Sheet Connection Error',
        message: err.message || 'Could not link Google Sheet.',
      });
      return { success: false, spreadsheetUrl: '' };
    }
  };

  const disconnectGoogleSheet = () => {
    const cleared: GoogleSheetsConfig = {
      isConnected: false,
      totalRowsLogged: 0,
      autoSyncEnabled: false,
    };
    setGoogleSheetsConfig(cleared);
    if (user?.uid) {
      saveUserLocalData(user.uid, { googleSheetsConfig: cleared });
      FirestoreSyncService.saveSheetsConfig(`biz_${user.uid}`, cleared);
    }
    addToast({
      type: 'info',
      title: 'Google Sheet Disconnected',
      message: 'Automatic logging to Google Sheets paused.',
    });
  };

  const exportActivityToCsv = () => {
    GoogleSheetsService.exportToCsv(
      autoReplyLogs,
      `${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_Email_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    addToast({
      type: 'success',
      title: 'Report Downloaded ✓',
      message: 'Downloaded client email activity as Excel/CSV.',
    });
  };

  // Import Google Doc into AI Knowledge Base
  const importGoogleDoc = async (
    docUrlOrId: string,
    category: KnowledgeCategory = 'Company Information'
  ): Promise<{ success: boolean; title: string; docId: string }> => {
    try {
      let docId = docUrlOrId.trim();
      const match = docId.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        docId = match[1];
      }

      if (!docId) {
        throw new Error('Please provide a valid Google Doc URL or ID.');
      }

      const docData = await GoogleDocsService.getDocumentContent(docId);
      const docItem: KnowledgeItem = {
        id: `gdoc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        businessId: business.id,
        title: docData.title || `Google Doc (${docId.slice(0, 8)})`,
        category,
        content: docData.text || 'Imported Google Doc content.',
        sourceFileName: `${docData.title}.gdoc`,
        sourceFileType: 'GOOGLE_DRIVE',
        sourceFileSize: `${Math.round((docData.text.length / 1024) * 10) / 10} KB`,
        sourceDriveFileId: docId,
        sourceDriveLink: `https://docs.google.com/document/d/${docId}/edit`,
        status: 'READY',
        isEnabled: true,
        lastDriveSyncAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setKnowledge(prev => {
        const next = [docItem, ...prev];
        if (user?.uid) saveUserLocalData(user.uid, { knowledge: next });
        return next;
      });

      FirestoreSyncService.saveKnowledgeItem(business.id, docItem);

      addToast({
        type: 'success',
        title: 'Google Doc Imported & Indexed ✓',
        message: `"${docData.title}" added to AI Knowledge Base.`,
      });

      return { success: true, title: docData.title, docId };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Google Doc Import Failed',
        message: err.message || 'Could not fetch Google Doc content.',
      });
      return { success: false, title: '', docId: '' };
    }
  };

  // Create a brand new Google Doc in user's Drive and index it
  const createGoogleDocKnowledge = async (
    title: string,
    content: string,
    category: KnowledgeCategory = 'Company Information'
  ): Promise<{ success: boolean; documentId: string; documentUrl: string }> => {
    try {
      const created = await GoogleDocsService.createDocument(title, content);
      const docItem: KnowledgeItem = {
        id: `gdoc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        businessId: business.id,
        title: title || 'New Knowledge Google Doc',
        category,
        content,
        sourceFileName: `${title}.gdoc`,
        sourceFileType: 'GOOGLE_DRIVE',
        sourceFileSize: `${Math.round((content.length / 1024) * 10) / 10} KB`,
        sourceDriveFileId: created.documentId,
        sourceDriveLink: created.documentUrl,
        status: 'READY',
        isEnabled: true,
        lastDriveSyncAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setKnowledge(prev => {
        const next = [docItem, ...prev];
        if (user?.uid) saveUserLocalData(user.uid, { knowledge: next });
        return next;
      });

      FirestoreSyncService.saveKnowledgeItem(business.id, docItem);

      addToast({
        type: 'success',
        title: 'Google Doc Created & Synced ✓',
        message: `Created "${title}" in Google Drive and indexed for AI replies.`,
      });

      return { success: true, documentId: created.documentId, documentUrl: created.documentUrl };
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Google Doc Creation Failed',
        message: err.message || 'Could not create Google Doc in Drive.',
      });
      return { success: false, documentId: '', documentUrl: '' };
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
    GoogleSheetsService.setAccessToken(null);
    setIsGoogleAuthenticated(false);

    // Reset runtime states to defaults, but keep saved user data in storage/firestore!
    setBusiness(INITIAL_BUSINESS);
    setAgent(INITIAL_AGENT);
    setKnowledge(INITIAL_KNOWLEDGE);
    setAutoReplyLogs([]);
    setGoogleSheetsConfig({
      isConnected: false,
      totalRowsLogged: 0,
      autoSyncEnabled: true,
    });

    addToast({
      type: 'info',
      title: 'Logged out securely',
      message: 'Your business profile, knowledge, and settings are saved under your Google account.',
    });
  };

  const updateAgent = (updates: Partial<EmailAgentConfig>) => {
    setAgent(prev => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      FirestoreSyncService.saveAgentConfig(business.id, updated);
      if (user?.uid) {
        saveUserLocalData(user.uid, { agent: updated });
      }
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
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKnowledge(prev => {
      const next = [newItem, ...prev];
      if (user?.uid) {
        saveUserLocalData(user.uid, { knowledge: next });
      }
      return next;
    });
    FirestoreSyncService.saveKnowledgeItem(business.id, newItem);

    setSubscription(prev => ({
      ...prev,
      storageBytesUsed: prev.storageBytesUsed + 120 * 1024,
    }));
    addToast({
      type: 'success',
      title: 'Knowledge indexed ✓',
      message: `"${item.title}" is now active for AI email answers.`,
    });
  };

  const updateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledge(prev => {
      const next = prev.map(k => {
        if (k.id === id) {
          const updated = { ...k, ...updates, updatedAt: new Date().toISOString() };
          FirestoreSyncService.saveKnowledgeItem(business.id, updated);
          return updated;
        }
        return k;
      });
      if (user?.uid) {
        saveUserLocalData(user.uid, { knowledge: next });
      }
      return next;
    });
    addToast({
      type: 'info',
      title: 'Knowledge updated',
    });
  };

  const deleteKnowledgeItem = (id: string) => {
    const item = knowledge.find(k => k.id === id);
    setKnowledge(prev => {
      const next = prev.filter(k => k.id !== id);
      if (user?.uid) {
        saveUserLocalData(user.uid, { knowledge: next });
      }
      return next;
    });
    FirestoreSyncService.deleteKnowledgeItem(business.id, id);
    addToast({
      type: 'info',
      title: 'Item removed',
      message: item ? `Deleted "${item.title}"` : undefined,
    });
  };

  const toggleKnowledgeItem = (id: string) => {
    setKnowledge(prev => {
      const next = prev.map(k => {
        if (k.id === id) {
          const updated = { ...k, isEnabled: !k.isEnabled };
          FirestoreSyncService.saveKnowledgeItem(business.id, updated);
          return updated;
        }
        return k;
      });
      if (user?.uid) {
        saveUserLocalData(user.uid, { knowledge: next });
      }
      return next;
    });
  };

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
      const token = GmailService.getAccessToken() || getCachedAccessToken();
      await GmailService.sendEmail({
        to: thread.customerEmail,
        subject: thread.subject.startsWith('Re: ') ? thread.subject : `Re: ${thread.subject}`,
        body: bodyToSend,
        threadId: thread.id,
        senderName: agent.name,
        businessName: business.name,
      }, token || undefined);

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
        message: `Email successfully sent to ${thread.customerEmail}`,
      });

      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to send email',
        message: err.message || 'Gmail API error occurred.',
      });
      return false;
    }
  };

  const rejectEmail = (threadId: string) => {
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, status: 'REJECTED', unread: false } : t))
    );
    addToast({
      type: 'info',
      title: 'Email dismissed',
    });
  };

  const escalateEmail = (threadId: string, reason?: string) => {
    setThreads(prev =>
      prev.map(t => (t.id === threadId ? { ...t, status: 'ESCALATED', unread: false } : t))
    );
    addToast({
      type: 'warning',
      title: 'Thread Escalated',
      message: reason || 'Assigned to human team lead.',
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
  };

  const connectGmail = (email?: string) => {
    connectGoogleAccount();
  };

  const disconnectGmail = () => {
    setGmailAccount(prev => ({
      ...prev,
      status: 'disconnected',
      isAuthenticOAuth: false,
    }));
    setIsGoogleAuthenticated(false);
    setCachedAccessToken(null);
    addToast({
      type: 'info',
      title: 'Gmail Disconnected',
      message: 'Background autoresponder is paused.',
    });
  };

  const syncGmailInbox = async (): Promise<{ processedCount: number; autoRepliedCount: number }> => {
    setIsSyncingGmail(true);
    try {
      const res = await pollAndAutoReplyGmail();
      return { processedCount: res.processed, autoRepliedCount: res.processed };
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const simulateIncomingEmail = async (emailData?: {
    subject: string;
    body: string;
    senderEmail: string;
    senderName: string;
  }) => {
    const threadId = `thr_${Date.now()}`;
    const subject = emailData?.subject || 'Pricing inquiry for website packages';
    const body = emailData?.body || 'Hello, I want to know about your Starter package pricing and turnaround.';
    const sender = emailData?.senderEmail || 'client@example.com';
    const senderName = emailData?.senderName || 'Prospective Client';

    const classification = await classifyEmailIntent(subject, body, sender);
    const retrievedChunks = retrieveRelevantKnowledge(`${subject} ${body}`, knowledge, 3);
    const generated = await generateAgentEmailReply({
      subject,
      body,
      customerName: senderName,
      businessName: business.name,
      agentConfig: agent,
      retrievedChunks,
      intent: classification.intent,
      enableWebSearch: true,
    });

    const newThread: EmailThread = {
      id: threadId,
      businessId: business.id,
      customerEmail: sender,
      customerName: senderName,
      subject,
      snippet: body.slice(0, 100),
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
      sender,
      senderName,
      recipient: gmailAccount.email,
      direction: 'INBOUND',
      body,
      createdAt: 'Just now',
    };

    const outboundMsg: EmailMessage = {
      id: `msg_out_${Date.now()}`,
      threadId,
      businessId: business.id,
      sender: gmailAccount.email,
      senderName: `${agent.name} (${business.name})`,
      recipient: sender,
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

    addToast({
      type: 'success',
      title: 'Incoming Email Handled ✓',
      message: `Auto-replied to "${subject}" from ${senderName}`,
    });
  };

  // Test live email sender
  const testSendLiveEmail = async (params: {
    toEmail: string;
    customerName?: string;
    subject: string;
    body: string;
  }): Promise<{ success: boolean; reply: string }> => {
    const classification = await classifyEmailIntent(params.subject, params.body, params.toEmail);
    const retrievedChunks = retrieveRelevantKnowledge(`${params.subject} ${params.body}`, knowledge, 4);

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

    const token = GmailService.getAccessToken() || getCachedAccessToken();
    await GmailService.sendEmail({
      to: params.toEmail,
      subject: params.subject.startsWith('Re: ') ? params.subject : `Re: ${params.subject}`,
      body: generated.reply,
      senderName: agent.name,
      businessName: business.name,
    }, token || undefined);

    // Auto-log to Google Sheets if connected
    if (googleSheetsConfig.isConnected && googleSheetsConfig.spreadsheetId) {
      GoogleSheetsService.logEmailReply(googleSheetsConfig.spreadsheetId, {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clientName: params.customerName || 'Test Client',
        clientEmail: params.toEmail,
        subject: params.subject,
        inquirySummary: params.body.slice(0, 250),
        replySummary: generated.reply.slice(0, 350),
        intent: classification.intent,
        status: 'DELIVERED',
      }, token || undefined).catch(e => console.warn('Google Sheet append notice:', e));

      setGoogleSheetsConfig(prev => {
        const next = {
          ...prev,
          totalRowsLogged: (prev.totalRowsLogged || 0) + 1,
          lastSyncedAt: new Date().toISOString(),
        };
        if (user?.uid) {
          saveUserLocalData(user.uid, { googleSheetsConfig: next });
          FirestoreSyncService.saveSheetsConfig(`biz_${user.uid}`, next);
        }
        return next;
      });
    }

    const threadId = `thr_live_${Date.now()}`;
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

    const token = GmailService.getAccessToken() || getCachedAccessToken();
    if (!token || token.startsWith('demo_')) {
      return { processed: 0 };
    }

    try {
      const unreadList = await GmailService.fetchUnreadEmails(5, token);
      if (!unreadList || unreadList.length === 0) {
        return { processed: 0 };
      }

      let count = 0;
      for (const item of unreadList) {
        if (handledMessageIdsRef.current.has(item.id)) continue;
        handledMessageIdsRef.current.add(item.id);

        // Prevent infinite loops: check if message was sent by ourselves
        const isSelf = item.from.toLowerCase().includes(gmailAccount.email.toLowerCase());
        const isReply = item.subject.toLowerCase().startsWith('re: ');
        const hasOurSignature =
          (agent.emailSignature && item.body.includes(agent.emailSignature)) ||
          item.body.includes('Customer Support Team') ||
          item.body.includes('Alex Jordan');

        if (isSelf && (isReply || hasOurSignature)) {
          await GmailService.markAsRead(item.id, token);
          continue;
        }

        // 1. Intent Classification & Spam / Newsletter Filter
        const classification = await classifyEmailIntent(item.subject, item.body, item.from);

        if (classification.isAutomatedSpamOrNewsletter) {
          await GmailService.markAsRead(item.id, token);
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
          setAutoReplyLogs(prev => {
            const next = [spamLog, ...prev.slice(0, 49)];
            if (user?.uid) {
              saveUserLocalData(user.uid, { autoReplyLogs: next });
              FirestoreSyncService.saveAutoReplyLogs(`biz_${user.uid}`, next);
            }
            return next;
          });
          continue;
        }

        // 2. Knowledge Retrieval (RAG) across Google Drive, Website, and Manual entries
        const retrievedChunks = retrieveRelevantKnowledge(
          `${item.subject} ${item.body}`,
          knowledge,
          4
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
        try {
          const sendRes = await GmailService.sendEmail({
            to: item.from,
            subject: item.subject.startsWith('Re: ') ? item.subject : `Re: ${item.subject}`,
            body: generated.reply,
            threadId: item.threadId,
            inReplyTo: item.id,
            senderName: agent.name,
            businessName: business.name,
          }, token);

          // 5. Mark as read in Gmail so we never process again
          await GmailService.markAsRead(item.id, token);

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

          setAutoReplyLogs(prev => {
            const next = [newLog, ...prev.slice(0, 49)];
            if (user?.uid) {
              saveUserLocalData(user.uid, { autoReplyLogs: next });
              FirestoreSyncService.saveAutoReplyLogs(`biz_${user.uid}`, next);
            }
            return next;
          });

          // 7. Auto-append to connected Google Sheet
          if (googleSheetsConfig.isConnected && googleSheetsConfig.spreadsheetId) {
            GoogleSheetsService.logEmailReply(googleSheetsConfig.spreadsheetId, {
              timestamp: new Date().toISOString(),
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              clientName: item.fromName,
              clientEmail: item.from,
              subject: item.subject,
              inquirySummary: item.body.slice(0, 200),
              replySummary: generated.reply.slice(0, 300),
              intent: classification.intent,
              status: 'DELIVERED',
            }, token).catch(e => console.warn('Google Sheet log error:', e));

            setGoogleSheetsConfig(prev => {
              const next = {
                ...prev,
                totalRowsLogged: (prev.totalRowsLogged || 0) + 1,
                lastSyncedAt: new Date().toISOString(),
              };
              if (user?.uid) {
                saveUserLocalData(user.uid, { googleSheetsConfig: next });
                FirestoreSyncService.saveSheetsConfig(`biz_${user.uid}`, next);
              }
              return next;
            });
          }

          // 8. Update thread
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
        } catch (sendError: any) {
          console.error('Failed to send email via Gmail API:', sendError);
          addToast({
            type: 'error',
            title: 'Gmail Reply Error',
            message: sendError.message || 'Could not send reply via Gmail API.',
          });
        }
      }

      return { processed: count };
    } catch (err: any) {
      console.warn('Auto responder background cycle notice:', err);
      return { processed: 0 };
    }
  };

  // Background timer to poll Gmail every 10 seconds
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
  }, [isAutoResponderActive, agent.autoReplyEnabled, business.name, knowledge, googleSheetsConfig]);

  // Website Crawler & Content Importer: crawls web data and backs up directly into Google Drive
  const importWebsiteData = async (targetUrl: string): Promise<{ success: boolean; itemsCount: number; data: ExtractedWebsiteData }> => {
    try {
      const data = await WebsiteCrawlerService.crawlWebsite(targetUrl);
      const newItems: KnowledgeItem[] = [];
      const cleanUrl = data.url;
      const domainClean = data.domain || targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

      // 1. Auto-upload structured knowledge file to user's Google Drive in "Mailora_AI_Knowledge_Base"
      let driveFileId: string | undefined;
      let driveViewLink: string | undefined;

      try {
        const docFileName = `Website_Knowledge_${domainClean}_${new Date().toISOString().slice(0, 10)}.txt`;
        const docContent = `========================================\nWEBSITE KNOWLEDGE BASE: ${cleanUrl}\nDomain: ${data.domain}\nPage Title: ${data.title}\nDescription: ${data.description}\nIndexed At: ${new Date().toISOString()}\n========================================\n\nCORE SERVICES & SOLUTIONS:\n${data.services.map(s => `- ${s}`).join('\n')}\n\nMAIN WEBSITE CONTENT:\n${data.mainText}\n\nCONTACT DETAILS:\nEmails: ${data.contactInfo.emails.join(', ') || 'N/A'}\nPhones: ${data.contactInfo.phones.join(', ') || 'N/A'}`;

        const driveUploadRes = await GoogleDriveService.uploadKnowledgeDocument(
          docFileName,
          docContent,
          'text/plain'
        );
        driveFileId = driveUploadRes.fileId;
        driveViewLink = driveUploadRes.webViewLink;
      } catch (driveErr) {
        console.warn('Google Drive auto upload notice:', driveErr);
      }

      // 2. Overview knowledge item
      const overviewItem: KnowledgeItem = {
        id: `site_overview_${Date.now()}`,
        businessId: business.id,
        title: `[Website Overview] ${data.title}`,
        category: 'Company Information',
        content: `Website URL: ${data.url}\nDomain: ${data.domain}\nPage Title: ${data.title}\nDescription: ${data.description}\n\nMain Content:\n${data.mainText}`,
        sourceUrl: data.url,
        sourceFileType: 'GOOGLE_DRIVE',
        sourceDriveFileId: driveFileId,
        sourceDriveLink: driveViewLink,
        status: 'READY',
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newItems.push(overviewItem);

      // 3. Services / Products item
      if (data.services.length > 0) {
        const servicesItem: KnowledgeItem = {
          id: `site_services_${Date.now()}`,
          businessId: business.id,
          title: `[Website Services] Core Offerings for ${data.domain}`,
          category: 'Services',
          content: `Key Services & Topics extracted from ${data.url}:\n- ${data.services.join('\n- ')}`,
          sourceUrl: data.url,
          sourceFileType: 'GOOGLE_DRIVE',
          sourceDriveFileId: driveFileId,
          sourceDriveLink: driveViewLink,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems.push(servicesItem);
      }

      // 4. Contact information item
      if (data.contactInfo.emails.length > 0 || data.contactInfo.phones.length > 0) {
        const contactItem: KnowledgeItem = {
          id: `site_contact_${Date.now()}`,
          businessId: business.id,
          title: `[Website Contact] Official Contact & Support Details`,
          category: 'Contact Information',
          content: `Official Contact Info for ${data.domain}:\nEmails: ${data.contactInfo.emails.join(', ') || 'N/A'}\nPhones: ${data.contactInfo.phones.join(', ') || 'N/A'}\nWebsite: ${data.url}`,
          sourceUrl: data.url,
          sourceFileType: 'GOOGLE_DRIVE',
          sourceDriveFileId: driveFileId,
          sourceDriveLink: driveViewLink,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems.push(contactItem);
      }

      // 5. Media assets catalog item
      if (data.images.length > 0) {
        const mediaItem: KnowledgeItem = {
          id: `site_media_${Date.now()}`,
          businessId: business.id,
          title: `[Website Visuals] Media Assets & Images for ${data.domain}`,
          category: 'Products',
          content: `Extracted visual assets from ${data.url}:\n${data.images.map(img => `Image: ${img.alt} (URL: ${img.src})`).join('\n')}`,
          sourceUrl: data.url,
          extractedImages: data.images.map(img => img.src),
          sourceFileType: 'GOOGLE_DRIVE',
          sourceDriveFileId: driveFileId,
          sourceDriveLink: driveViewLink,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems.push(mediaItem);
      }

      // Save to state, user local storage, and firestore
      setKnowledge(prev => {
        const next = [...newItems, ...prev];
        if (user?.uid) {
          saveUserLocalData(user.uid, { knowledge: next });
        }
        return next;
      });

      for (const item of newItems) {
        FirestoreSyncService.saveKnowledgeItem(business.id, item);
      }

      addToast({
        type: 'success',
        title: 'Website Data Saved to Google Drive & Indexed ✓',
        message: `Successfully crawled ${data.domain}. Auto-synced to your Google Drive knowledge folder!`,
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

        // Auto-upload to Google Drive as well
        let driveFileId: string | undefined;
        let driveLink: string | undefined;
        try {
          const driveRes = await GoogleDriveService.uploadKnowledgeDocument(file.name, textContent, 'text/plain');
          driveFileId = driveRes.fileId;
          driveLink = driveRes.webViewLink;
        } catch {}

        const newItem: KnowledgeItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          businessId: business.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category,
          content: textContent || `Uploaded file document: ${file.name}`,
          sourceFileName: file.name,
          sourceFileType: 'GOOGLE_DRIVE',
          sourceFileSize: `${(file.size / 1024).toFixed(1)} KB`,
          sourceDriveFileId: driveFileId,
          sourceDriveLink: driveLink,
          status: 'READY',
          isEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setKnowledge(prev => {
          const next = [newItem, ...prev];
          if (user?.uid) {
            saveUserLocalData(user.uid, { knowledge: next });
          }
          return next;
        });

        FirestoreSyncService.saveKnowledgeItem(business.id, newItem);

        addToast({
          type: 'success',
          title: 'File Uploaded & Synced to Drive ✓',
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
        if (user?.uid) {
          saveUserLocalData(user.uid, { business: updated });
        }
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
        if (user?.uid) {
          saveUserLocalData(user.uid, { agent: updated });
        }
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
        if (user?.uid) {
          saveUserLocalData(user.uid, { knowledge: combined });
        }
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
        if (user?.uid) {
          saveUserLocalData(user.uid, { knowledge: next });
        }
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

    setBusiness(prev => {
      const updated = {
        ...prev,
        industry: tmpl.name,
      };
      if (user?.uid) saveUserLocalData(user.uid, { business: updated });
      return updated;
    });

    setAgent(prev => {
      const updated = {
        ...prev,
        instructions: tmpl.sampleInstruction,
      };
      if (user?.uid) saveUserLocalData(user.uid, { agent: updated });
      return updated;
    });

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

    setKnowledge(prev => {
      const next = [...newFaqs, ...prev];
      if (user?.uid) saveUserLocalData(user.uid, { knowledge: next });
      return next;
    });

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
        googleSheetsConfig,
        connectGoogleSheet,
        disconnectGoogleSheet,
        exportActivityToCsv,
        importGoogleDoc,
        createGoogleDocKnowledge,
        connectGoogleDrive,
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
