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
  createdAt: { seconds: number; nanoseconds: number };
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
  scheduledPostAt?: { seconds: number; nanoseconds: number };
  actuallyPostedAt?: { seconds: number; nanoseconds: number };
  livePostUrl?: string;
  internalNotes?: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  generatedHooks: { text: string; angle: string; selected: boolean }[];
  drafts: {
    version: number;
    text: string;
    createdAt: { seconds: number; nanoseconds: number };
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
    lastFetched: { seconds: number; nanoseconds: number };
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
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  subClients: SubClient[]; // New field for sub-clients
  hard_facts?: {}; // Optional field for hard facts
  aiTraining: {
    status: 'pending_data' | 'training_queued' | 'completed' | 'failed';
    lastTrainedAt: { seconds: number; nanoseconds: number };
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
  createdAt: { seconds: number; nanoseconds: number };
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
    currentPeriodEnd: { seconds: number; nanoseconds: number };
    createdAtSubscription: { seconds: number; nanoseconds: number };
    paymentHistory: {
      paymentDate: { seconds: number; nanoseconds: number };
      amount: number;
      transactionId: string;
    }[];
  };
  createdAtAgency: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  settings: {
    defaultLanguage: string;
    timezone: string;
  };
  apiUsage: {
    postsGeneratedThisMonth: number;
    clientsManagedCount: number;
    lastCalculationDate: { seconds: number; nanoseconds: number };
  };
  referral: {
    code: string;
    balance: number;
    source: string;
  };
  successfulExecutions: number;
  adminNotes?: string;
}
