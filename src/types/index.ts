export type UserRole = 'owner' | 'admin' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  businessId: string;
  role: UserRole;
  createdAt: string;
}

export interface Business {
  id: string;
  ownerUid: string;
  name: string;
  industry: string;
  website?: string;
  timezone: string;
  supportEmail?: string;
  createdAt: string;
}

export type AgentStatus = 'ACTIVE' | 'PAUSED';
export type AgentTone = 'Professional' | 'Friendly' | 'Formal' | 'Concise' | 'Empathetic';
export type ReplyLanguage = 'English' | 'Bangla' | 'Bangla + English' | 'Multi-language (Auto-detect)';

export interface EmailAgentConfig {
  id: string;
  businessId: string;
  name: string;
  status: AgentStatus;
  autoReplyEnabled: boolean;
  humanApprovalRequired: boolean;
  replyLanguage: ReplyLanguage;
  tone: AgentTone;
  instructions: string;
  emailSignature: string;
  confidenceThreshold: number; // e.g. 0.85
  updatedAt: string;
}

export type KnowledgeCategory = 
  | 'Company Information'
  | 'Products'
  | 'Services'
  | 'Pricing'
  | 'FAQ'
  | 'Refund Policy'
  | 'Shipping Policy'
  | 'Opening Hours'
  | 'Contact Information'
  | 'Custom';

export interface KnowledgeItem {
  id: string;
  businessId: string;
  title: string;
  category: KnowledgeCategory;
  content: string;
  sourceFileName?: string;
  sourceFileType?: string;
  sourceFileSize?: string;
  sourceDriveFileId?: string;
  sourceDriveLink?: string;
  lastDriveSyncAt?: string;
  status: 'READY' | 'PROCESSING' | 'FAILED';
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  size?: number | string;
  modifiedTime: string;
  isFolder?: boolean;
  syncedAsKnowledgeId?: string;
}

export interface GoogleDriveSyncStatus {
  connected: boolean;
  accountEmail?: string;
  lastSyncTime?: string;
  syncedDocsCount: number;
  autoSyncEnabled: boolean;
  targetFolderId?: string;
  targetFolderName?: string;
}

export type EmailIntent =
  | 'Sales inquiry'
  | 'Product question'
  | 'Pricing'
  | 'Support'
  | 'Complaint'
  | 'Refund'
  | 'Booking'
  | 'Appointment'
  | 'Partnership'
  | 'Job application'
  | 'General inquiry'
  | 'Spam'
  | 'Other';

export type ThreadStatus = 'AUTO_REPLIED' | 'NEEDS_REVIEW' | 'ESCALATED' | 'FAILED' | 'RESOLVED';

export interface EmailThread {
  id: string;
  businessId: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  snippet: string;
  detectedIntent: EmailIntent;
  status: ThreadStatus;
  confidenceScore: number;
  lastMessageAt: string;
  unread: boolean;
  matchedKnowledgeIds?: string[];
  aiReviewReason?: string;
}

export type MessageDirection = 'INBOUND' | 'OUTBOUND_AI' | 'OUTBOUND_HUMAN';

export interface EmailMessage {
  id: string;
  threadId: string;
  businessId: string;
  sender: string;
  senderName: string;
  recipient: string;
  direction: MessageDirection;
  body: string;
  createdAt: string;
  aiDraft?: string;
  reviewReason?: string;
  matchedKnowledgeSummary?: string[];
  wasEditedByHuman?: boolean;
}

export type AutomationTrigger = 'EMAIL_RECEIVED';
export type AutomationAction = 'AUTO_REPLY' | 'REVIEW_QUEUE' | 'ESCALATE_HUMAN' | 'IGNORE';

export interface AutomationRule {
  id: string;
  businessId: string;
  name: string;
  trigger: AutomationTrigger;
  conditionIntent: EmailIntent | 'ANY';
  action: AutomationAction;
  isActive: boolean;
  createdAt: string;
}

export type SubscriptionPlanTier = 'Free' | 'Starter' | 'Business' | 'Pro';

export interface SubscriptionInfo {
  businessId: string;
  plan: SubscriptionPlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  emailsHandled: number;
  emailQuota: number;
  storageBytesUsed: number;
  storageQuotaBytes: number;
  renewalDate: string;
  aiCredits: number;
  aiCreditsTotal: number;
}

export interface ConnectedGmailAccount {
  email: string;
  name: string;
  status: 'connected' | 'disconnected' | 'needs_reauth';
  connectedAt: string;
  dailySentCount: number;
  dailyQuota: number;
  isDemo: boolean;
  isAuthenticOAuth?: boolean;
  avatarUrl?: string;
  grantedScopes?: string[];
  lastVerifiedAt?: string;
}

export interface TestAgentAnalysis {
  intent: EmailIntent;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'urgent' | 'negative';
  retrievedKnowledge: {
    id: string;
    title: string;
    category: string;
    similarity: number;
    snippet: string;
  }[];
  decision: 'AUTO_REPLY' | 'NEEDS_REVIEW' | 'ESCALATE_HUMAN';
  reviewReason?: string;
  suggestedReply: string;
  latencyMs: number;
}

export interface AutoReplyLog {
  id: string;
  messageId: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  incomingSnippet: string;
  replySnippet: string;
  fullReply: string;
  intent: EmailIntent | string;
  timestamp: string;
  status: 'DELIVERED' | 'SENT';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}
