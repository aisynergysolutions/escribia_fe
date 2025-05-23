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
  createdAt: { seconds: number; nanoseconds: number };
}

export const mockIdeas: Idea[] = [
  {
    id: 'idea1',
    clientId: 'client1',
    title: 'The Future of AI in Marketing',
    initialIdeaPrompt: 'Explore how AI will transform marketing strategies in the next 5 years.',
    currentDraftText: "In the next five years, AI is poised to revolutionize marketing. From predictive analytics to personalized customer experiences, discover how AI will redefine marketing strategies and create unprecedented opportunities for businesses.",
    finalApprovedText: "Approved: AI will revolutionize marketing. Dive into predictive analytics and personalized experiences.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    templateUsedId: 'template123',
    scheduledPostAt: { seconds: 1672531200, nanoseconds: 0 }, // January 1, 2023
    actuallyPostedAt: { seconds: 1672531200, nanoseconds: 0 },
    livePostUrl: 'https://example.com/ai-marketing',
    internalNotes: 'Focus on actionable insights for marketers.',
    createdAt: { seconds: 1670025600, nanoseconds: 0 }, // December 2, 2022
    updatedAt: { seconds: 1671235200, nanoseconds: 0 }, // December 17, 2022
    generatedHooks: [
      { text: 'AI is not just a tool, it\'s a paradigm shift.', angle: 'Provocative', selected: true },
      { text: 'Unlock the power of AI in your marketing campaigns.', angle: 'Informative', selected: false },
      { text: 'Is AI the key to marketing success?', angle: 'Questioning', selected: false }
    ],
    drafts: [
      { version: 1, text: 'Initial draft exploring AI in marketing.', createdAt: { seconds: 1670025600, nanoseconds: 0 }, generatedByAI: true },
      { version: 2, text: 'Revised draft with more specific examples.', createdAt: { seconds: 1670630400, nanoseconds: 0 }, generatedByAI: true, notes: 'Added examples of AI applications.' }
    ],
    visuals: {
      assetUrl: 'https://example.com/ai-marketing-image.jpg',
      status: 'approved',
      notes: 'Ensure the image is relevant to the content.'
    },
    performance: {
      likes: 150,
      comments: 30,
      shares: 15,
      views: 1500,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 } // December 31, 2022
    },
    aiProcessingInfo: {
      modelUsed: 'GPT-3',
      log: 'Generated initial draft and revised with examples.'
    }
  },
  {
    id: 'idea2',
    clientId: 'client2',
    title: 'The Impact of Remote Work on Company Culture',
    initialIdeaPrompt: 'Discuss the challenges and opportunities of maintaining company culture in a remote work environment.',
    currentDraftText: "Remote work has transformed the modern workplace, presenting both challenges and opportunities for maintaining a strong company culture. Discover strategies to foster connection, collaboration, and engagement among remote teams.",
    finalApprovedText: "Approved: Remote work's impact on culture. Strategies for connection and engagement.",
    status: 'Drafting',
    objective: 'Brand Awareness',
    templateUsedId: 'template456',
    scheduledPostAt: { seconds: 1672617600, nanoseconds: 0 }, // January 2, 2023
    actuallyPostedAt: { seconds: 1672617600, nanoseconds: 0 },
    livePostUrl: 'https://example.com/remote-work-culture',
    internalNotes: 'Highlight the importance of virtual team-building activities.',
    createdAt: { seconds: 1670112000, nanoseconds: 0 }, // December 3, 2022
    updatedAt: { seconds: 1671321600, nanoseconds: 0 }, // December 18, 2022
    generatedHooks: [
      { text: 'Remote work: the new normal or a passing trend?', angle: 'Questioning', selected: false },
      { text: 'Building a thriving company culture in a remote world.', angle: 'Informative', selected: true },
      { text: 'The secret to successful remote team collaboration.', angle: 'Intriguing', selected: false }
    ],
    drafts: [
      { version: 1, text: 'Initial draft on remote work and culture.', createdAt: { seconds: 1670112000, nanoseconds: 0 }, generatedByAI: true },
      { version: 2, text: 'Revised draft with emphasis on team-building.', createdAt: { seconds: 1670716800, nanoseconds: 0 }, generatedByAI: true, notes: 'Added virtual team-building ideas.' }
    ],
    visuals: {
      assetUrl: 'https://example.com/remote-work-image.jpg',
      status: 'pending',
      notes: 'Awaiting approval for the selected image.'
    },
    performance: {
      likes: 120,
      comments: 25,
      shares: 10,
      views: 1200,
      lastFetched: { seconds: 1672531200, nanoseconds: 0 } // January 1, 2023
    },
    aiProcessingInfo: {
      modelUsed: 'GPT-3',
      log: 'Generated initial draft and revised with team-building ideas.'
    }
  },
];

export const mockClients: Client[] = [
  {
    id: 'client1',
    clientName: 'Tech Solutions Inc.',
    industry: 'Technology',
    contactName: 'John Doe',
    contactEmail: 'john.doe@techsolutions.com',
    createdAt: { seconds: 1669852800, nanoseconds: 0 }
  },
  {
    id: 'client2',
    clientName: 'Global Marketing Corp',
    industry: 'Marketing',
    contactName: 'Jane Smith',
    contactEmail: 'jane.smith@globalmarketing.com',
    createdAt: { seconds: 1669939200, nanoseconds: 0 }
  },
];

export const mockTemplates = [
  {
    id: 'template1',
    templateName: 'Thought Leadership Post',
    templateContent: 'In my experience working with [industry], I\'ve found that [insight]. This has led me to believe that [opinion]. What do you think? Has your experience been similar?',
    objective: 'Thought Leadership',
    funnelStage: 'TOFU',
    contentType: 'text',
    scope: 'agency_specific',
    agencyId: 'agency_1',
    createdAt: { seconds: 1714416000, nanoseconds: 0 },
    usageCount: 12,
    examplePlaceholders: { industry: 'manufacturing', insight: 'automation improves efficiency by 40%', opinion: 'human oversight remains critical' },
    tags: ['thought leadership', 'industry insights', 'discussion starter']
  },
  {
    id: 'template2',
    templateName: 'Product Showcase',
    templateContent: "Excited to announce our latest [product]! It's designed to solve [problem] for [target audience]. Key features include:\n\n• [feature 1]\n• [feature 2]\n• [feature 3]\n\nLearn more at the link below!",
    objective: 'Product Launch',
    funnelStage: 'MOFU',
    contentType: 'text',
    scope: 'agency_specific',
    agencyId: 'agency_1',
    createdAt: { seconds: 1714329600, nanoseconds: 0 },
    usageCount: 8,
    examplePlaceholders: { 
      product: 'AI-powered CRM', 
      problem: 'lead prioritization', 
      'target audience': 'B2B sales teams', 
      'feature 1': 'Predictive scoring',
      'feature 2': 'Automated follow-ups',
      'feature 3': 'Performance analytics'
    },
    tags: ['product launch', 'feature highlight', 'announcement']
  },
  {
    id: 'template3',
    templateName: 'Event Invitation',
    templateContent: "Join us for [event name] on [date] at [time]! We'll be discussing [topic] with industry experts including [speaker names]. \n\nWhy attend?\n• [benefit 1]\n• [benefit 2]\n• [benefit 3]\n\nRegister now - limited spots available!",
    objective: 'Event Promotion',
    funnelStage: 'TOFU',
    contentType: 'text',
    scope: 'agency_specific',
    agencyId: 'agency_1',
    createdAt: { seconds: 1714243200, nanoseconds: 0 },
    usageCount: 5,
    examplePlaceholders: {
      'event name': 'Digital Transformation Summit',
      date: 'October 15',
      time: '2PM EST',
      topic: 'AI adoption in enterprise',
      'speaker names': 'Jane Doe (CTO, TechCorp) and John Smith (AI Research Lead, InnovateCo)',
      'benefit 1': 'Networking with industry leaders',
      'benefit 2': 'Exclusive market insights',
      'benefit 3': 'Hands-on workshops'
    },
    tags: ['event', 'webinar', 'networking']
  }
];
