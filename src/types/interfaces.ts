export interface Idea {
  id: string;
  clientId: string;
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
  industry: string;
  contactName: string;
  contactEmail: string;
  status: 'active' | 'onboarding' | 'paused' | 'archived';
  profileImage?: string;
  brandBriefSummary?: string;
  writingStyle?: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  brandProfile: {
    language: string;
    locationFocus: string;
    businessSize: string;
    sellsWhat: string;
    sellsToWhom: string;
    brandPersonality: string[];
    brandTone: string;
    emotionsToEvoke: string[];
    emojiUsage: string;
    desiredPostLength: string;
    coreValues: string;
    brandStory: string;
    uniqueSellingProposition: string;
    hotTakesOrOpinions: string;
    missionStatement: string;
    inspirationSources: string;
    recentCompanyEvents: string;
    linkedinProfileUrl: string;
    trainingDataUrls: string[];
    customInstructionsAI: string;
  };
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

export interface LinkedInAccount {
  id: string;
  clientId: string;
  accountName: string;
  accountType: 'company' | 'executive' | 'department' | 'other';
  linkedinProfileUrl: string;
  linkedinUserId?: string;
  isConnected: boolean;
  connectionStatus: 'connected' | 'expired' | 'disconnected' | 'pending';
  connectionExpiresAt?: { seconds: number; nanoseconds: number };
  
  // Account-specific overrides (inherit from client if not set)
  displayName: string;
  profileImage?: string;
  writingStyle?: string;
  brandPersonality?: string[];
  brandTone?: string;
  customInstructions?: string;
  
  // Metadata
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  lastUsedAt?: { seconds: number; nanoseconds: number };
  
  // Analytics
  totalPosts: number;
  lastPostAt?: { seconds: number; nanoseconds: number };
}
