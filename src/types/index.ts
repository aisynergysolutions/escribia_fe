
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
}

export interface PaymentHistory {
  paymentDate: Timestamp;
  amount: number;
  transactionId: string;
}

export interface Subscription {
  status: string;
  planId: string;
  stripeCustomerId: string;
  currentPeriodEnd: Timestamp;
  createdAtSubscription: Timestamp;
  paymentHistory: PaymentHistory[];
}

export interface ApiUsage {
  postsGeneratedThisMonth: number;
  clientsManagedCount: number;
  lastCalculationDate: Timestamp;
}

export interface Settings {
  defaultLanguage: string;
  timezone: string;
}

export interface Referral {
  code: string;
  balance: number;
  source: string;
}

export interface Agency {
  agencyName: string;
  primaryContactEmail: string;
  subscription: Subscription;
  createdAtAgency: Timestamp;
  updatedAt: Timestamp;
  settings: Settings;
  apiUsage: ApiUsage;
  referral: Referral;
  successfulExecutions: number;
  adminNotes?: string;
}

export interface BrandProfile {
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
}

export interface AITraining {
  status: 'pending_data' | 'training_queued' | 'completed' | 'failed';
  lastTrainedAt: Timestamp;
  modelVersion: string;
}

export interface Client {
  id?: string;
  agencyId: string;
  clientName: string;
  status: 'active' | 'onboarding' | 'paused' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  brandProfile: BrandProfile;
  writingStyle?: string;
  brandBriefSummary?: string;
  aiTraining: AITraining;
}

export interface GeneratedHook {
  text: string;
  angle: string;
  selected: boolean;
}

export interface Draft {
  version: number;
  text: string;
  createdAt: Timestamp;
  notes?: string;
  generatedByAI: boolean;
}

export interface Visuals {
  assetUrl: string;
  notes?: string;
  status: string;
}

export interface AIProcessingInfo {
  log: string;
  modelUsed: string;
}

export interface Performance {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  lastFetched: Timestamp;
}

export interface Idea {
  id?: string;
  agencyId: string;
  clientId: string;
  title: string;
  status: 'Idea' | 'Drafting' | 'AwaitingReview' | 'Approved' | 'Scheduled' | 'Posted' | 'NeedsRevision' | 'NeedsVisual';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  initialIdeaPrompt: string;
  generatedHooks: GeneratedHook[];
  drafts: Draft[];
  currentDraftText: string;
  finalApprovedText?: string;
  visuals?: Visuals;
  scheduledPostAt?: Timestamp;
  actuallyPostedAt?: Timestamp;
  livePostUrl?: string;
  templateUsedId?: string;
  objective: string;
  aiProcessingInfo: AIProcessingInfo;
  internalNotes?: string;
  performance?: Performance;
}

export interface ExamplePlaceholders {
  [key: string]: string;
}

export interface Template {
  id?: string;
  templateName: string;
  templateContent: string;
  objective: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  contentType: 'text' | 'poll' | 'carrousel';
  scope: string;
  agencyId: string;
  createdAt: Timestamp;
  usageCount: number;
  examplePlaceholders: ExamplePlaceholders;
  tags: string[];
}

// Mock data for development
export const mockAgency: Agency = {
  agencyName: "Acme Media Agency",
  primaryContactEmail: "hello@acme.com",
  subscription: {
    status: "active",
    planId: "premium_monthly",
    stripeCustomerId: "cus_123456",
    currentPeriodEnd: { seconds: 1717027200, nanoseconds: 0 },
    createdAtSubscription: { seconds: 1682986856, nanoseconds: 0 },
    paymentHistory: [
      {
        paymentDate: { seconds: 1682986856, nanoseconds: 0 },
        amount: 199.99,
        transactionId: "tx_123456"
      }
    ]
  },
  createdAtAgency: { seconds: 1682986856, nanoseconds: 0 },
  updatedAt: { seconds: 1714348800, nanoseconds: 0 },
  settings: {
    defaultLanguage: "en",
    timezone: "Europe/Madrid"
  },
  apiUsage: {
    postsGeneratedThisMonth: 42,
    clientsManagedCount: 5,
    lastCalculationDate: { seconds: 1714262400, nanoseconds: 0 }
  },
  referral: {
    code: "REF-42",
    balance: 12,
    source: "partner"
  },
  successfulExecutions: 142,
  adminNotes: "Beta customer; 50 seats."
};

export const mockClients: Client[] = [
  {
    id: "client1",
    agencyId: "agency1",
    clientName: "Globex Corporation",
    status: "active",
    createdAt: { seconds: 1682986856, nanoseconds: 0 },
    updatedAt: { seconds: 1714262400, nanoseconds: 0 },
    brandProfile: {
      language: "en",
      locationFocus: "Global",
      businessSize: "Enterprise",
      sellsWhat: "Advanced Technology Solutions",
      sellsToWhom: "Fortune 500 Companies",
      brandPersonality: ["Innovative", "Trustworthy", "Professional"],
      brandTone: "Professional yet approachable",
      emotionsToEvoke: ["Confidence", "Trust", "Excitement"],
      emojiUsage: "Minimal",
      desiredPostLength: "Medium (300-500 characters)",
      coreValues: "Innovation, Quality, Customer Success",
      brandStory: "Founded in 2000, Globex has been at the forefront of technology innovation...",
      uniqueSellingProposition: "Enterprise-grade solutions with unmatched customer support",
      hotTakesOrOpinions: "AI will augment, not replace human creativity",
      missionStatement: "To make advanced technology accessible to businesses of all sizes",
      inspirationSources: "Tech thought leaders, industry reports",
      recentCompanyEvents: "Product launch, Series C funding",
      linkedinProfileUrl: "https://linkedin.com/company/globex",
      trainingDataUrls: ["https://globex.com/blog", "https://globex.com/case-studies"],
      customInstructionsAI: "Focus on enterprise benefits and ROI in all content"
    },
    writingStyle: "Professional with data-driven insights",
    brandBriefSummary: "Enterprise tech solutions provider focused on innovation and client success",
    aiTraining: {
      status: "completed",
      lastTrainedAt: { seconds: 1714003200, nanoseconds: 0 },
      modelVersion: "1.2.0"
    }
  },
  {
    id: "client2",
    agencyId: "agency1",
    clientName: "Initech Software",
    status: "onboarding",
    createdAt: { seconds: 1714003200, nanoseconds: 0 },
    updatedAt: { seconds: 1714089600, nanoseconds: 0 },
    brandProfile: {
      language: "en",
      locationFocus: "North America",
      businessSize: "SMB",
      sellsWhat: "Business Software Solutions",
      sellsToWhom: "Small and Medium Businesses",
      brandPersonality: ["Helpful", "Friendly", "Expert"],
      brandTone: "Conversational and helpful",
      emotionsToEvoke: ["Relief", "Empowerment", "Optimism"],
      emojiUsage: "Moderate",
      desiredPostLength: "Short (150-250 characters)",
      coreValues: "Simplicity, Effectiveness, Support",
      brandStory: "Born from the frustration of overly complex software...",
      uniqueSellingProposition: "Software that just works, without the complexity",
      hotTakesOrOpinions: "Most business software is unnecessarily complicated",
      missionStatement: "Making business software that people actually enjoy using",
      inspirationSources: "Customer feedback, usability studies",
      recentCompanyEvents: "New UI launch, customer milestone (1000+ users)",
      linkedinProfileUrl: "https://linkedin.com/company/initech",
      trainingDataUrls: ["https://initech.com/blog"],
      customInstructionsAI: "Keep it simple, avoid jargon, focus on ease of use"
    },
    brandBriefSummary: "Maker of simple, effective business software for SMBs",
    aiTraining: {
      status: "pending_data",
      lastTrainedAt: { seconds: 0, nanoseconds: 0 },
      modelVersion: ""
    }
  },
  {
    id: "client3",
    agencyId: "agency1",
    clientName: "Umbrella Health",
    status: "active",
    createdAt: { seconds: 1682986856, nanoseconds: 0 },
    updatedAt: { seconds: 1714176000, nanoseconds: 0 },
    brandProfile: {
      language: "en",
      locationFocus: "United States",
      businessSize: "Large (1000+ employees)",
      sellsWhat: "Healthcare Services and Technology",
      sellsToWhom: "Hospitals, Clinics, and Patients",
      brandPersonality: ["Caring", "Expert", "Reliable"],
      brandTone: "Warm and reassuring",
      emotionsToEvoke: ["Trust", "Relief", "Confidence"],
      emojiUsage: "Minimal",
      desiredPostLength: "Medium-long (400-600 characters)",
      coreValues: "Patient care, Innovation, Accessibility",
      brandStory: "Founded by healthcare professionals seeking better patient outcomes...",
      uniqueSellingProposition: "Technology that improves patient care and provider efficiency",
      hotTakesOrOpinions: "Prevention is the best medicine",
      missionStatement: "To improve healthcare outcomes through technology and compassion",
      inspirationSources: "Medical journals, patient stories",
      recentCompanyEvents: "New clinic opening, Research publication",
      linkedinProfileUrl: "https://linkedin.com/company/umbrella-health",
      trainingDataUrls: ["https://umbrella-health.com/research", "https://umbrella-health.com/news"],
      customInstructionsAI: "Balance technical accuracy with approachable language, focus on patient benefits"
    },
    writingStyle: "Warm, informative, and evidence-based",
    brandBriefSummary: "Healthcare innovator focused on improving patient outcomes through technology",
    aiTraining: {
      status: "completed",
      lastTrainedAt: { seconds: 1713916800, nanoseconds: 0 },
      modelVersion: "1.2.0"
    }
  }
];

export const mockIdeas: Idea[] = [
  {
    id: "idea1",
    agencyId: "agency1",
    clientId: "client1",
    title: "AI Trends in Enterprise",
    status: "Posted",
    createdAt: { seconds: 1713830400, nanoseconds: 0 },
    updatedAt: { seconds: 1713916800, nanoseconds: 0 },
    initialIdeaPrompt: "Create a post about emerging AI trends for enterprise businesses",
    generatedHooks: [
      {
        text: "Is your enterprise ready for the AI revolution?",
        angle: "Challenge",
        selected: true
      },
      {
        text: "5 AI trends transforming enterprise operations in 2025",
        angle: "List",
        selected: false
      }
    ],
    drafts: [
      {
        version: 1,
        text: "First draft about AI trends...",
        createdAt: { seconds: 1713830400, nanoseconds: 0 },
        generatedByAI: true
      },
      {
        version: 2,
        text: "Refined draft with more specific examples...",
        createdAt: { seconds: 1713916800, nanoseconds: 0 },
        notes: "Added specific industry examples",
        generatedByAI: false
      }
    ],
    currentDraftText: "Final version of the AI trends post with specific examples and a call to action.",
    finalApprovedText: "Final version of the AI trends post with specific examples and a call to action.",
    visuals: {
      assetUrl: "https://example.com/images/ai-trends.jpg",
      notes: "Chart showing AI adoption rates",
      status: "approved"
    },
    scheduledPostAt: { seconds: 1714003200, nanoseconds: 0 },
    actuallyPostedAt: { seconds: 1714003200, nanoseconds: 0 },
    livePostUrl: "https://linkedin.com/post/123456",
    objective: "thought_leadership",
    aiProcessingInfo: {
      log: "Generated 3 hooks, refined based on feedback",
      modelUsed: "gpt-4"
    },
    performance: {
      likes: 45,
      comments: 12,
      shares: 8,
      views: 1250,
      lastFetched: { seconds: 1714176000, nanoseconds: 0 }
    }
  },
  {
    id: "idea2",
    agencyId: "agency1",
    clientId: "client1",
    title: "Customer Success Story: XYZ Corp",
    status: "AwaitingReview",
    createdAt: { seconds: 1714003200, nanoseconds: 0 },
    updatedAt: { seconds: 1714089600, nanoseconds: 0 },
    initialIdeaPrompt: "Create a case study post about XYZ Corp's successful implementation",
    generatedHooks: [
      {
        text: "How XYZ Corp achieved 300% ROI with our solution",
        angle: "Case Study",
        selected: true
      }
    ],
    drafts: [
      {
        version: 1,
        text: "Draft of the XYZ Corp success story...",
        createdAt: { seconds: 1714003200, nanoseconds: 0 },
        generatedByAI: true
      }
    ],
    currentDraftText: "XYZ Corp faced significant challenges with their legacy systems. After implementing our solution, they saw a 300% ROI within just 6 months. The key factors in their success were...",
    objective: "social_proof",
    aiProcessingInfo: {
      log: "Generated based on case study document",
      modelUsed: "gpt-4"
    }
  },
  {
    id: "idea3",
    agencyId: "agency1",
    clientId: "client3",
    title: "Preventive Healthcare Tips",
    status: "Scheduled",
    createdAt: { seconds: 1714089600, nanoseconds: 0 },
    updatedAt: { seconds: 1714176000, nanoseconds: 0 },
    initialIdeaPrompt: "Create a helpful post with preventive healthcare tips",
    generatedHooks: [
      {
        text: "5 simple habits that can transform your health",
        angle: "List",
        selected: true
      }
    ],
    drafts: [
      {
        version: 1,
        text: "Initial draft of preventive healthcare tips...",
        createdAt: { seconds: 1714089600, nanoseconds: 0 },
        generatedByAI: true
      },
      {
        version: 2,
        text: "Revised draft with medical fact-checking...",
        createdAt: { seconds: 1714176000, nanoseconds: 0 },
        notes: "Reviewed by Dr. Smith",
        generatedByAI: false
      }
    ],
    currentDraftText: "Prevention is always better than cure. Here are 5 evidence-based habits that can significantly improve your health: 1. Regular physical activity (at least 150 minutes/week) 2. Adequate hydration (8 glasses of water daily) 3. Sufficient sleep (7-8 hours nightly) 4. Annual preventive screenings 5. Stress management practices",
    finalApprovedText: "Prevention is always better than cure. Here are 5 evidence-based habits that can significantly improve your health: 1. Regular physical activity (at least 150 minutes/week) 2. Adequate hydration (8 glasses of water daily) 3. Sufficient sleep (7-8 hours nightly) 4. Annual preventive screenings 5. Stress management practices",
    scheduledPostAt: { seconds: 1714435200, nanoseconds: 0 },
    objective: "educational",
    aiProcessingInfo: {
      log: "Generated content, verified with medical sources",
      modelUsed: "gpt-4"
    }
  }
];

export const mockTemplates: Template[] = [
  {
    id: "template1",
    templateName: "Thought Leadership",
    templateContent: "The future of {{industry}} is changing rapidly. Here are {{number}} key trends that {{company}} is watching closely: {{trends}}. What's your perspective on these shifts?",
    objective: "engagement",
    funnelStage: "TOFU",
    contentType: "text",
    scope: "agency_specific",
    agencyId: "agency1",
    createdAt: { seconds: 1682986856, nanoseconds: 0 },
    usageCount: 12,
    examplePlaceholders: {
      industry: "technology",
      number: "3",
      company: "Acme Inc",
      trends: "AI, blockchain, quantum computing"
    },
    tags: ["thought_leadership", "industry_trends"]
  },
  {
    id: "template2",
    templateName: "Product Announcement",
    templateContent: "Exciting news! We've just launched {{product_name}}, designed to help {{target_audience}} achieve {{benefit}}. Learn more here: {{link}}",
    objective: "awareness",
    funnelStage: "MOFU",
    contentType: "text",
    scope: "agency_specific",
    agencyId: "agency1",
    createdAt: { seconds: 1687986856, nanoseconds: 0 },
    usageCount: 8,
    examplePlaceholders: {
      product_name: "ProductX",
      target_audience: "marketing teams",
      benefit: "50% faster campaign creation",
      link: "https://example.com/product"
    },
    tags: ["product_launch", "announcement"]
  },
  {
    id: "template3",
    templateName: "Client Success Poll",
    templateContent: "We helped {{client_name}} achieve {{result}}. What aspect of this success story interests you most? Vote below!\n\nA) The strategy behind it\nB) The implementation process\nC) The measurable results\nD) How it could apply to your business",
    objective: "engagement",
    funnelStage: "BOFU",
    contentType: "poll",
    scope: "agency_specific",
    agencyId: "agency1",
    createdAt: { seconds: 1697986856, nanoseconds: 0 },
    usageCount: 5,
    examplePlaceholders: {
      client_name: "XYZ Corp",
      result: "300% ROI in 6 months"
    },
    tags: ["case_study", "social_proof", "poll"]
  }
];
