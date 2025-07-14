import { Timestamp } from 'firebase/firestore';

export interface SubClient {
  id: string;
  name: string;
  role: string; // e.g., "Company", "CEO", "CTO", "COO"
  profileImage?: string;
  writingStyle?: string;
  linkedinConnected: boolean;
  linkedinAccountName?: string;
  linkedinExpiryDate?: string;
  customInstructions?: string;
  createdAt: Timestamp;
}

export interface Idea {
  id: string;
  clientId: string;
  subClientId?: string; // New field to link to specific sub-client
  title: string;
  initialIdeaPrompt: string;
  currentDraftText: string;
  finalApprovedText?: string;
  status: string;
  objective: string;
  templateUsedId?: string;
  scheduledPostAt?: Timestamp;
  actuallyPostedAt?: Timestamp;
  livePostUrl?: string;
  internalNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  generatedHooks: { text: string; angle: string; selected: boolean }[];
  drafts: {
    version: number;
    text: string;
    createdAt: Timestamp;
    generatedByAI: boolean;
    notes?: string;
  }[];
  visuals?: {
    assetUrl: string;
    status: 'approved' | 'pending' | 'rejected';
    notes?: string;
  };
  performance?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    lastFetched: Timestamp;
  };
  aiProcessingInfo?: {
    modelUsed: string;
    log: string;
  };
}

export interface Client {
  id: string;
  clientName: string;
  agencyId: string;
  onboarding_link?: string; // Optional field for onboarding link
  industry: string;
  contactName: string;
  contactEmail: string;
  status: string;
  profileImage?: string;
  brandBriefSummary?: string;
  writingStyle?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subClients: SubClient[]; // New field for sub-clients
  hard_facts?: {}; // Optional field for hard facts
  aiTraining: {
    status: 'pending_data' | 'training_queued' | 'completed' | 'failed';
    lastTrainedAt: Timestamp;
    modelVersion?: string;
  };
}

export interface Template {
  id: string;
  templateName: string;
  templateContent: string;
  objective: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  contentType: string;
  scope: string;
  agencyId: string;
  createdAt: Timestamp;
  usageCount: number;
  examplePlaceholders: Record<string, string>;
  tags: string[];
}

export interface Agency {
  id: string;
  agencyName: string;
  primaryContactEmail: string;
  subscription: {
    status: string;
    planId: string;
    stripeCustomerId: string;
    currentPeriodEnd: Timestamp;
    createdAtSubscription: Timestamp;
    paymentHistory: {
      paymentDate: Timestamp;
      amount: number;
      transactionId: string;
    }[];
  };
  createdAtAgency: Timestamp;
  updatedAt: Timestamp;
  settings: {
    defaultLanguage: string;
    timezone: string;
  };
  apiUsage: {
    postsGeneratedThisMonth: number;
    clientsManagedCount: number;
    lastCalculationDate: Timestamp;
  };
  referral: {
    code: string;
    balance: number;
    source: string;
  };
  successfulExecutions: number;
  adminNotes?: string;
}
