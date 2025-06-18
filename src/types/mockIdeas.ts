
import { Idea } from './interfaces';

export const mockIdeas: Idea[] = [
  // Tech Solutions Inc. posts
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
    scheduledPostAt: { seconds: 1735732800, nanoseconds: 0 }, // January 1, 2025
    actuallyPostedAt: { seconds: 1672531200, nanoseconds: 0 },
    livePostUrl: 'https://example.com/ai-marketing',
    internalNotes: 'Focus on actionable insights for marketers.',
    createdAt: { seconds: 1670025600, nanoseconds: 0 },
    updatedAt: { seconds: 1671235200, nanoseconds: 0 },
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
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    },
    aiProcessingInfo: {
      modelUsed: 'GPT-3',
      log: 'Generated initial draft and revised with examples.'
    }
  },
  {
    id: 'idea2',
    clientId: 'client1',
    title: 'Enterprise Software ROI Metrics',
    initialIdeaPrompt: 'Discuss how to measure ROI on enterprise software investments.',
    currentDraftText: "Measuring ROI on enterprise software isn't just about cost savings. It's about transformation, efficiency, and competitive advantage. Here's how leading companies track real value from their tech investments.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1735905600, nanoseconds: 0 }, // January 3, 2025
    createdAt: { seconds: 1670112000, nanoseconds: 0 },
    updatedAt: { seconds: 1670716800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Your enterprise software ROI might be wrong', angle: 'Provocative', selected: true },
      { text: 'How to calculate true enterprise software value', angle: 'Informative', selected: false }
    ],
    drafts: [
      { version: 1, text: 'Initial draft on ROI metrics.', createdAt: { seconds: 1670112000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea3',
    clientId: 'client1',
    title: 'Digital Transformation Mistakes',
    initialIdeaPrompt: 'Common pitfalls companies face during digital transformation.',
    currentDraftText: "Digital transformation failures aren't about technology - they're about people, processes, and culture. Here are the 5 critical mistakes that derail transformation projects.",
    status: 'Published',
    objective: 'Thought Leadership',
    actuallyPostedAt: { seconds: 1669852800, nanoseconds: 0 },
    createdAt: { seconds: 1669766400, nanoseconds: 0 },
    updatedAt: { seconds: 1669852800, nanoseconds: 0 },
    generatedHooks: [
      { text: '95% of digital transformations fail. Here\'s why.', angle: 'Shocking', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Draft about transformation mistakes.', createdAt: { seconds: 1669766400, nanoseconds: 0 }, generatedByAI: true }
    ],
    performance: {
      likes: 89,
      comments: 12,
      shares: 8,
      views: 890,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    }
  },
  {
    id: 'idea4',
    clientId: 'client1',
    title: 'Cloud Security Best Practices',
    initialIdeaPrompt: 'Essential security practices for cloud enterprise environments.',
    currentDraftText: "Cloud security isn't an afterthought - it's the foundation of digital trust. Here's how enterprise leaders are building bulletproof cloud architectures.",
    status: 'Approved',
    objective: 'Brand Awareness',
    createdAt: { seconds: 1670198400, nanoseconds: 0 },
    updatedAt: { seconds: 1670803200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Your cloud is only as secure as your weakest link', angle: 'Warning', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Cloud security best practices draft.', createdAt: { seconds: 1670198400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea5',
    clientId: 'client2',
    title: 'The Impact of Remote Work on Company Culture',
    initialIdeaPrompt: 'Discuss the challenges and opportunities of maintaining company culture in a remote work environment.',
    currentDraftText: "Remote work has transformed the modern workplace, presenting both challenges and opportunities for maintaining a strong company culture. Discover strategies to foster connection, collaboration, and engagement among remote teams.",
    finalApprovedText: "Approved: Remote work's impact on culture. Strategies for connection and engagement.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    templateUsedId: 'template456',
    scheduledPostAt: { seconds: 1735819200, nanoseconds: 0 }, // January 2, 2025
    actuallyPostedAt: { seconds: 1672617600, nanoseconds: 0 },
    livePostUrl: 'https://example.com/remote-work-culture',
    internalNotes: 'Highlight the importance of virtual team-building activities.',
    createdAt: { seconds: 1670112000, nanoseconds: 0 },
    updatedAt: { seconds: 1671321600, nanoseconds: 0 },
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
      lastFetched: { seconds: 1672531200, nanoseconds: 0 }
    },
    aiProcessingInfo: {
      modelUsed: 'GPT-3',
      log: 'Generated initial draft and revised with team-building ideas.'
    }
  },
  {
    id: 'idea6',
    clientId: 'client2',
    title: 'Content Marketing Trends 2024',
    initialIdeaPrompt: 'Explore the latest content marketing trends for the upcoming year.',
    currentDraftText: "2024 is bringing revolutionary changes to content marketing. From AI-generated content to interactive experiences, here's what brands need to know to stay ahead.",
    status: 'Published',
    objective: 'Thought Leadership',
    actuallyPostedAt: { seconds: 1670284800, nanoseconds: 0 },
    createdAt: { seconds: 1670198400, nanoseconds: 0 },
    updatedAt: { seconds: 1670284800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Content marketing is dead. Long live content experiences! 🚀', angle: 'Provocative', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Draft about 2024 content marketing trends.', createdAt: { seconds: 1670198400, nanoseconds: 0 }, generatedByAI: true }
    ],
    performance: {
      likes: 200,
      comments: 45,
      shares: 32,
      views: 2100,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    }
  },
  {
    id: 'idea7',
    clientId: 'client2',
    title: 'Social Media Algorithm Changes',
    initialIdeaPrompt: 'How recent algorithm changes affect brand visibility.',
    currentDraftText: "Algorithm changes got you down? Here's how smart brands are adapting their social media strategy to thrive, not just survive, in the new landscape.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736078400, nanoseconds: 0 }, // January 5, 2025
    createdAt: { seconds: 1670371200, nanoseconds: 0 },
    updatedAt: { seconds: 1670976000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Algorithm changes are killing organic reach - or are they? 🤔', angle: 'Questioning', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Draft about algorithm adaptation.', createdAt: { seconds: 1670371200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea8',
    clientId: 'client2',
    title: 'Video Marketing ROI Guide',
    initialIdeaPrompt: 'Measuring the return on investment for video marketing campaigns.',
    currentDraftText: "Video marketing budgets are exploding, but are they worth it? Here's how to measure real ROI beyond vanity metrics and prove video's business impact.",
    status: 'Approved',
    objective: 'Lead Generation',
    createdAt: { seconds: 1670457600, nanoseconds: 0 },
    updatedAt: { seconds: 1671062400, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Your video marketing ROI calculation is probably wrong 📊', angle: 'Challenging', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Video ROI measurement guide draft.', createdAt: { seconds: 1670457600, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea9',
    clientId: 'client3',
    title: 'Telemedicine Best Practices',
    initialIdeaPrompt: 'Guidelines for effective telemedicine consultations.',
    currentDraftText: "Telemedicine isn't just a pandemic response - it's the future of healthcare delivery. Here's how providers can create meaningful patient connections in virtual environments.",
    status: 'Published',
    objective: 'Thought Leadership',
    actuallyPostedAt: { seconds: 1670544000, nanoseconds: 0 },
    createdAt: { seconds: 1670457600, nanoseconds: 0 },
    updatedAt: { seconds: 1670544000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Telemedicine is changing doctor-patient relationships forever', angle: 'Transformative', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Telemedicine best practices guide.', createdAt: { seconds: 1670457600, nanoseconds: 0 }, generatedByAI: true }
    ],
    performance: {
      likes: 85,
      comments: 18,
      shares: 12,
      views: 950,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    }
  },
  {
    id: 'idea10',
    clientId: 'client3',
    title: 'Patient Data Security in Digital Health',
    initialIdeaPrompt: 'Protecting patient privacy in the digital age.',
    currentDraftText: "Patient trust begins with data security. As healthcare goes digital, here's how medical organizations are building fortress-level protection around patient information.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1735992000, nanoseconds: 0 }, // January 4, 2025
    createdAt: { seconds: 1670630400, nanoseconds: 0 },
    updatedAt: { seconds: 1671235200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Your medical data is more valuable than your credit card', angle: 'Alarming', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Patient data security draft.', createdAt: { seconds: 1670630400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea11',
    clientId: 'client3',
    title: 'Mental Health Technology Solutions',
    initialIdeaPrompt: 'How technology is improving mental health care access.',
    currentDraftText: "Mental health care is being revolutionized by technology. From AI-powered therapy apps to virtual reality treatments, discover how innovation is breaking down barriers to care.",
    status: 'Approved',
    objective: 'Thought Leadership',
    createdAt: { seconds: 1670716800, nanoseconds: 0 },
    updatedAt: { seconds: 1671321600, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Technology is making mental health care accessible to millions', angle: 'Hopeful', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Mental health technology overview.', createdAt: { seconds: 1670716800, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea12',
    clientId: 'client3',
    title: 'Preventive Care in the Digital Age',
    initialIdeaPrompt: 'Using technology for proactive health monitoring.',
    currentDraftText: "Prevention is better than cure, and technology is making it easier than ever. Here's how digital health tools are helping people stay healthy before they get sick.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1736164800, nanoseconds: 0 }, // January 6, 2025
    createdAt: { seconds: 1670803200, nanoseconds: 0 },
    updatedAt: { seconds: 1671408000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Your smartphone could be your best health guardian', angle: 'Empowering', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Preventive care technology draft.', createdAt: { seconds: 1670803200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea13',
    clientId: 'client4',
    title: 'Carbon Neutral vs Carbon Negative',
    initialIdeaPrompt: 'Explaining the difference and why it matters for businesses.',
    currentDraftText: "Carbon neutral isn't enough anymore. Forward-thinking companies are going carbon negative, and here's why your business should too. The future belongs to regenerative enterprises.",
    status: 'Published',
    objective: 'Thought Leadership',
    actuallyPostedAt: { seconds: 1670889600, nanoseconds: 0 },
    createdAt: { seconds: 1670803200, nanoseconds: 0 },
    updatedAt: { seconds: 1670889600, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Carbon neutral is the new minimum - here\'s what comes next 🌱', angle: 'Progressive', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Carbon neutral vs negative explanation.', createdAt: { seconds: 1670803200, nanoseconds: 0 }, generatedByAI: true }
    ],
    performance: {
      likes: 156,
      comments: 34,
      shares: 28,
      views: 1680,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    }
  },
  {
    id: 'idea14',
    clientId: 'client4',
    title: 'Sustainable Supply Chain Management',
    initialIdeaPrompt: 'How companies can make their supply chains more environmentally friendly.',
    currentDraftText: "Your supply chain is your sustainability weak link. Here's how leading companies are transforming their entire value chain to reduce environmental impact.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736251200, nanoseconds: 0 }, // January 7, 2025
    createdAt: { seconds: 1670976000, nanoseconds: 0 },
    updatedAt: { seconds: 1671580800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Your supply chain is destroying the planet (and your reputation)', angle: 'Confrontational', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Sustainable supply chain guide.', createdAt: { seconds: 1670976000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea15',
    clientId: 'client4',
    title: 'Green Technology ROI Calculator',
    initialIdeaPrompt: 'Demonstrating the financial benefits of environmental investments.',
    currentDraftText: "Green technology pays for itself faster than you think. Here's how to calculate the real ROI of environmental investments and make the business case for sustainability.",
    status: 'Approved',
    objective: 'Lead Generation',
    createdAt: { seconds: 1671062400, nanoseconds: 0 },
    updatedAt: { seconds: 1671667200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Green tech ROI will surprise you (in the best way) 💚', angle: 'Positive Surprise', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Green technology ROI analysis.', createdAt: { seconds: 1671062400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea16',
    clientId: 'client5',
    title: 'Small Business Cash Flow Mistakes',
    initialIdeaPrompt: 'Common cash flow management errors that hurt small businesses.',
    currentDraftText: "Cash flow kills more businesses than bad products. Here are the 7 deadly cash flow mistakes small business owners make and how to avoid them.",
    status: 'Published',
    objective: 'Lead Generation',
    actuallyPostedAt: { seconds: 1671148800, nanoseconds: 0 },
    createdAt: { seconds: 1671062400, nanoseconds: 0 },
    updatedAt: { seconds: 1671148800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Cash flow mistakes that kill profitable businesses 💸', angle: 'Warning', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Cash flow mistakes guide.', createdAt: { seconds: 1671062400, nanoseconds: 0 }, generatedByAI: true }
    ],
    performance: {
      likes: 98,
      comments: 22,
      shares: 15,
      views: 1200,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    }
  },
  {
    id: 'idea17',
    clientId: 'client5',
    title: 'Financial Planning for Entrepreneurs',
    initialIdeaPrompt: 'Essential financial planning strategies for business owners.',
    currentDraftText: "Entrepreneurs are terrible at personal finance (I should know, I was one). Here's the financial planning framework that actually works for business owners.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1736337600, nanoseconds: 0 }, // January 8, 2025
    createdAt: { seconds: 1671235200, nanoseconds: 0 },
    updatedAt: { seconds: 1671840000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Why entrepreneurs suck at personal finance (and how to fix it)', angle: 'Self-deprecating', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Entrepreneur financial planning guide.', createdAt: { seconds: 1671235200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea18',
    clientId: 'client5',
    title: 'Tax Strategies for Growing Businesses',
    initialIdeaPrompt: 'Smart tax planning for scaling companies.',
    currentDraftText: "Growing businesses face complex tax challenges. Here's how smart entrepreneurs optimize their tax strategy as they scale from startup to established company.",
    status: 'Approved',
    objective: 'Lead Generation',
    createdAt: { seconds: 1671321600, nanoseconds: 0 },
    updatedAt: { seconds: 1671926400, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Tax strategies that scale with your business growth 📈', angle: 'Growth-focused', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Tax strategies for growing businesses.', createdAt: { seconds: 1671321600, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea19',
    clientId: 'client6',
    title: 'Sustainable Building Materials Guide',
    initialIdeaPrompt: 'Overview of eco-friendly construction materials and their benefits.',
    currentDraftText: "Building green isn't just trendy - it's necessary. Here's our guide to sustainable materials that don't compromise on quality or durability.",
    status: 'Drafting',
    objective: 'Brand Awareness',
    createdAt: { seconds: 1671408000, nanoseconds: 0 },
    updatedAt: { seconds: 1672012800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Sustainable building materials that actually work 🔨', angle: 'Practical', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Sustainable materials overview.', createdAt: { seconds: 1671408000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea20',
    clientId: 'client6',
    title: 'Home Renovation Cost Planning',
    initialIdeaPrompt: 'How to budget effectively for home renovation projects.',
    currentDraftText: "Renovation budgets always go over. Here's how we help homeowners plan realistic budgets and avoid costly surprises during construction.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736424000, nanoseconds: 0 }, // January 9, 2025
    createdAt: { seconds: 1671494400, nanoseconds: 0 },
    updatedAt: { seconds: 1672099200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Why renovation budgets explode (and how to prevent it)', angle: 'Problem-solving', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Renovation budgeting guide.', createdAt: { seconds: 1671494400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea21',
    clientId: 'client6',
    title: 'Energy Efficient Home Design',
    initialIdeaPrompt: 'Design principles for energy-efficient homes.',
    currentDraftText: "Energy efficiency starts with smart design. Here's how we're building homes that slash utility bills while maximizing comfort year-round.",
    status: 'Published',
    objective: 'Thought Leadership',
    actuallyPostedAt: { seconds: 1671580800, nanoseconds: 0 },
    createdAt: { seconds: 1671494400, nanoseconds: 0 },
    updatedAt: { seconds: 1671580800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Cut your energy bills in half with smart home design 🏠', angle: 'Benefit-focused', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Energy efficient design principles.', createdAt: { seconds: 1671494400, nanoseconds: 0 }, generatedByAI: true }
    ],
    performance: {
      likes: 67,
      comments: 12,
      shares: 8,
      views: 720,
      lastFetched: { seconds: 1672444800, nanoseconds: 0 }
    }
  },

  // Additional posts to fill every day with 1, 2, or 4 posts
  // January 1, 2025 - 3 more posts (total 4)
  {
    id: 'idea22',
    clientId: 'client1',
    title: 'New Year Tech Predictions',
    initialIdeaPrompt: 'Share bold predictions for the technology industry in 2025.',
    currentDraftText: "2025 will be the year of quantum computing breakthroughs, AI governance, and sustainable tech. Here are our bold predictions for the tech industry.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    scheduledPostAt: { seconds: 1735747200, nanoseconds: 0 }, // January 1, 2025 12:00 PM
    createdAt: { seconds: 1671580800, nanoseconds: 0 },
    updatedAt: { seconds: 1672012800, nanoseconds: 0 },
    generatedHooks: [
      { text: '2025 tech predictions that will blow your mind 🚀', angle: 'Exciting', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Tech predictions for 2025.', createdAt: { seconds: 1671580800, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea23',
    clientId: 'client2',
    title: 'New Year Marketing Goals',
    initialIdeaPrompt: 'Guide on setting effective marketing goals for the new year.',
    currentDraftText: "New year, new marketing strategy. Here's how to set realistic, achievable marketing goals that will drive real business growth in 2025.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1735761600, nanoseconds: 0 }, // January 1, 2025 4:00 PM
    createdAt: { seconds: 1671667200, nanoseconds: 0 },
    updatedAt: { seconds: 1672099200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Stop setting marketing goals that fail by February', angle: 'Challenging', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Marketing goals framework.', createdAt: { seconds: 1671667200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea24',
    clientId: 'client3',
    title: 'Healthcare Resolutions That Work',
    initialIdeaPrompt: 'Help patients set sustainable health goals and resolutions.',
    currentDraftText: "Most health resolutions fail by February. Here's how healthcare providers can help patients set and achieve sustainable health goals.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1735776000, nanoseconds: 0 }, // January 1, 2025 8:00 PM
    createdAt: { seconds: 1671753600, nanoseconds: 0 },
    updatedAt: { seconds: 1672185600, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Why 92% of health resolutions fail (and how to be the 8%)', angle: 'Statistical', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Sustainable health goals guide.', createdAt: { seconds: 1671753600, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 2, 2025 - 1 more post (total 2)
  {
    id: 'idea25',
    clientId: 'client4',
    title: 'Sustainable New Year Habits',
    initialIdeaPrompt: 'Share eco-friendly habits that people can adopt for a sustainable new year.',
    currentDraftText: "Make 2025 your most sustainable year yet. Small eco-friendly habits that make a big environmental impact throughout the year.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1735876800, nanoseconds: 0 }, // January 2, 2025 6:00 PM
    createdAt: { seconds: 1671840000, nanoseconds: 0 },
    updatedAt: { seconds: 1672272000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Tiny eco-habits that save the planet (and your wallet) 🌍', angle: 'Beneficial', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Sustainable habits guide.', createdAt: { seconds: 1671840000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 3, 2025 - 3 more posts (total 4)
  {
    id: 'idea26',
    clientId: 'client2',
    title: 'Q1 Content Planning Strategy',
    initialIdeaPrompt: 'Create a comprehensive guide for planning Q1 content strategy.',
    currentDraftText: "Q1 sets the tone for your entire content year. Here's how to plan a content calendar that drives engagement and conversions from day one.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1735920000, nanoseconds: 0 }, // January 3, 2025 10:00 AM
    createdAt: { seconds: 1671926400, nanoseconds: 0 },
    updatedAt: { seconds: 1672358400, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Q1 content planning mistakes that kill your whole year', angle: 'Warning', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Q1 content strategy guide.', createdAt: { seconds: 1671926400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea27',
    clientId: 'client5',
    title: 'January Financial Reset',
    initialIdeaPrompt: 'Guide businesses on resetting their finances for the new year.',
    currentDraftText: "New year, clean financial slate. Here's how to reset your business finances for a profitable 2025, from budgeting to tax preparation.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1735934400, nanoseconds: 0 }, // January 3, 2025 2:00 PM
    createdAt: { seconds: 1672012800, nanoseconds: 0 },
    updatedAt: { seconds: 1672444800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Financial reset checklist that saves businesses thousands', angle: 'Value-driven', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Financial reset guide.', createdAt: { seconds: 1672012800, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea28',
    clientId: 'client6',
    title: 'Winter Construction Tips',
    initialIdeaPrompt: 'Share professional tips for construction projects during winter.',
    currentDraftText: "Cold weather doesn't mean construction stops. Here are professional tips for safe, efficient winter building projects.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    scheduledPostAt: { seconds: 1735948800, nanoseconds: 0 }, // January 3, 2025 6:00 PM
    createdAt: { seconds: 1672099200, nanoseconds: 0 },
    updatedAt: { seconds: 1672531200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Winter construction secrets contractors don\'t want you to know', angle: 'Insider', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Winter construction best practices.', createdAt: { seconds: 1672099200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 4, 2025 - 1 more post (total 2)
  {
    id: 'idea29',
    clientId: 'client1',
    title: 'Enterprise Security Audit 2025',
    initialIdeaPrompt: 'Create a comprehensive security audit checklist for enterprises.',
    currentDraftText: "Start 2025 with a comprehensive security audit. Here's our checklist for identifying and fixing enterprise security vulnerabilities.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736035200, nanoseconds: 0 }, // January 4, 2025 2:00 PM
    createdAt: { seconds: 1672185600, nanoseconds: 0 },
    updatedAt: { seconds: 1672617600, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Security vulnerabilities hiding in your enterprise systems', angle: 'Alarming', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Enterprise security audit guide.', createdAt: { seconds: 1672185600, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 5, 2025 - 3 more posts (total 4)
  {
    id: 'idea30',
    clientId: 'client3',
    title: 'Digital Health Trends 2025',
    initialIdeaPrompt: 'Explore the top digital health trends transforming healthcare.',
    currentDraftText: "Healthcare is going digital faster than ever. Here are the top digital health trends that will transform patient care in 2025.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    scheduledPostAt: { seconds: 1736092800, nanoseconds: 0 }, // January 5, 2025 9:00 AM
    createdAt: { seconds: 1672272000, nanoseconds: 0 },
    updatedAt: { seconds: 1672704000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Digital health innovations revolutionizing patient care', angle: 'Transformative', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Digital health trends overview.', createdAt: { seconds: 1672272000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea31',
    clientId: 'client4',
    title: 'Corporate Sustainability Reporting',
    initialIdeaPrompt: 'Help companies prepare for mandatory sustainability reporting requirements.',
    currentDraftText: "Sustainability reporting is becoming mandatory. Here's how to prepare your company for new environmental disclosure requirements.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736107200, nanoseconds: 0 }, // January 5, 2025 1:00 PM
    createdAt: { seconds: 1672358400, nanoseconds: 0 },
    updatedAt: { seconds: 1672790400, nanoseconds: 0 },
    generatedHooks: [
      { text: 'New sustainability rules that could cost your company millions', angle: 'Urgent', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Sustainability reporting guide.', createdAt: { seconds: 1672358400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea32',
    clientId: 'client6',
    title: 'Smart Home Integration Planning',
    initialIdeaPrompt: 'Guide homeowners on planning smart home technology integration.',
    currentDraftText: "Planning a smart home renovation? Here's how to future-proof your home with integrated technology that adds real value.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1736121600, nanoseconds: 0 }, // January 5, 2025 5:00 PM
    createdAt: { seconds: 1672444800, nanoseconds: 0 },
    updatedAt: { seconds: 1672876800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Smart home tech that actually increases property value', angle: 'Value-focused', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Smart home integration guide.', createdAt: { seconds: 1672444800, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // Continue adding posts for remaining days...
  // January 6, 2025 - 1 more post (total 2)
  {
    id: 'idea33',
    clientId: 'client2',
    title: 'Influencer Marketing Ethics',
    initialIdeaPrompt: 'Discuss ethical practices in influencer marketing partnerships.',
    currentDraftText: "Influencer marketing is under scrutiny. Here's how brands can build ethical, transparent partnerships that benefit everyone.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    scheduledPostAt: { seconds: 1736193600, nanoseconds: 0 }, // January 6, 2025 1:00 PM
    createdAt: { seconds: 1672531200, nanoseconds: 0 },
    updatedAt: { seconds: 1672963200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Influencer scandals killing brand trust (how to avoid them)', angle: 'Risk-focused', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Ethical influencer marketing guide.', createdAt: { seconds: 1672531200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 7, 2025 - 3 more posts (total 4)
  {
    id: 'idea34',
    clientId: 'client1',
    title: 'AI Ethics in Enterprise',
    initialIdeaPrompt: 'Explore responsible AI implementation practices for enterprises.',
    currentDraftText: "As AI becomes ubiquitous, ethical considerations are paramount. Here's how enterprises can implement responsible AI practices.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    scheduledPostAt: { seconds: 1736265600, nanoseconds: 0 }, // January 7, 2025 10:00 AM
    createdAt: { seconds: 1672617600, nanoseconds: 0 },
    updatedAt: { seconds: 1673049600, nanoseconds: 0 },
    generatedHooks: [
      { text: 'AI bias in your enterprise systems (and how to fix it)', angle: 'Problem-solving', selected: true }
    ],
    drafts: [
      { version: 1, text: 'AI ethics implementation guide.', createdAt: { seconds: 1672617600, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea35',
    clientId: 'client5',
    title: 'Investment Strategies for 2025',
    initialIdeaPrompt: 'Share proven investment strategies for uncertain market conditions.',
    currentDraftText: "Market volatility requires new investment approaches. Here are proven strategies for building wealth in uncertain times.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736280000, nanoseconds: 0 }, // January 7, 2025 2:00 PM
    createdAt: { seconds: 1672704000, nanoseconds: 0 },
    updatedAt: { seconds: 1673136000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Investment mistakes costing you thousands in 2025', angle: 'Financial Risk', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Investment strategy guide.', createdAt: { seconds: 1672704000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea36',
    clientId: 'client3',
    title: 'Healthcare Worker Burnout Solutions',
    initialIdeaPrompt: 'Address healthcare worker burnout with evidence-based solutions.',
    currentDraftText: "Healthcare worker burnout is at crisis levels. Here are evidence-based solutions to support healthcare teams and improve patient care.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1736294400, nanoseconds: 0 }, // January 7, 2025 6:00 PM
    createdAt: { seconds: 1672790400, nanoseconds: 0 },
    updatedAt: { seconds: 1673222400, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Healthcare burnout crisis threatens patient safety', angle: 'Urgent Health', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Healthcare burnout solutions.', createdAt: { seconds: 1672790400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 8, 2025 - 1 more post (total 2)
  {
    id: 'idea37',
    clientId: 'client4',
    title: 'Green Building Certification Guide',
    initialIdeaPrompt: 'Navigate the complex world of green building certifications.',
    currentDraftText: "LEED, BREEAM, WELL - navigating green building certifications can be complex. Here's our comprehensive guide to choosing the right certification.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736366400, nanoseconds: 0 }, // January 8, 2025 12:00 PM
    createdAt: { seconds: 1672876800, nanoseconds: 0 },
    updatedAt: { seconds: 1673308800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Green certifications that boost property value by 20%', angle: 'Value Proposition', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Green building certification comparison.', createdAt: { seconds: 1672876800, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 9, 2025 - 3 more posts (total 4)
  {
    id: 'idea38',
    clientId: 'client2',
    title: 'Voice Search Optimization',
    initialIdeaPrompt: 'Optimize content for voice search and conversational queries.',
    currentDraftText: "Voice search is changing SEO forever. Here's how to optimize your content for voice queries and conversational search.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736438400, nanoseconds: 0 }, // January 9, 2025 9:00 AM
    createdAt: { seconds: 1672963200, nanoseconds: 0 },
    updatedAt: { seconds: 1673395200, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Voice search killing your SEO (here\'s how to fight back)', angle: 'Competitive', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Voice search optimization guide.', createdAt: { seconds: 1672963200, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea39',
    clientId: 'client1',
    title: 'Cloud Migration Security',
    initialIdeaPrompt: 'Address security challenges during cloud migration projects.',
    currentDraftText: "Cloud migration introduces new security challenges. Here's how to maintain security during and after your cloud transition.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736452800, nanoseconds: 0 }, // January 9, 2025 1:00 PM
    createdAt: { seconds: 1673049600, nanoseconds: 0 },
    updatedAt: { seconds: 1673481600, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Cloud migration security gaps putting your data at risk', angle: 'Security Risk', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Cloud migration security checklist.', createdAt: { seconds: 1673049600, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea40',
    clientId: 'client6',
    title: 'Bathroom Renovation Trends 2025',
    initialIdeaPrompt: 'Showcase the latest bathroom renovation trends that add value.',
    currentDraftText: "Bathroom renovations offer the highest ROI. Here are 2025's top bathroom trends that combine style, functionality, and value.",
    status: 'Scheduled',
    objective: 'Brand Awareness',
    scheduledPostAt: { seconds: 1736467200, nanoseconds: 0 }, // January 9, 2025 5:00 PM
    createdAt: { seconds: 1673136000, nanoseconds: 0 },
    updatedAt: { seconds: 1673568000, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Bathroom trends that increase home value by 30%', angle: 'Value-driven', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Bathroom renovation trends guide.', createdAt: { seconds: 1673136000, nanoseconds: 0 }, generatedByAI: true }
    ]
  },

  // January 10, 2025 - 2 posts
  {
    id: 'idea41',
    clientId: 'client3',
    title: 'Pediatric Telemedicine Best Practices',
    initialIdeaPrompt: 'Share best practices for effective pediatric telemedicine consultations.',
    currentDraftText: "Telemedicine with children requires special considerations. Here's how pediatric providers can deliver effective virtual care.",
    status: 'Scheduled',
    objective: 'Thought Leadership',
    scheduledPostAt: { seconds: 1736524800, nanoseconds: 0 }, // January 10, 2025 10:00 AM
    createdAt: { seconds: 1673222400, nanoseconds: 0 },
    updatedAt: { seconds: 1673654400, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Pediatric telemedicine secrets for better patient outcomes', angle: 'Educational', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Pediatric telemedicine guide.', createdAt: { seconds: 1673222400, nanoseconds: 0 }, generatedByAI: true }
    ]
  },
  {
    id: 'idea42',
    clientId: 'client5',
    title: 'Small Business Tax Deadlines 2025',
    initialIdeaPrompt: 'Create a comprehensive tax deadline calendar for small businesses.',
    currentDraftText: "Don't miss critical tax deadlines that could cost your business thousands. Here's your complete 2025 tax calendar.",
    status: 'Scheduled',
    objective: 'Lead Generation',
    scheduledPostAt: { seconds: 1736553600, nanoseconds: 0 }, // January 10, 2025 6:00 PM
    createdAt: { seconds: 1673308800, nanoseconds: 0 },
    updatedAt: { seconds: 1673740800, nanoseconds: 0 },
    generatedHooks: [
      { text: 'Tax deadlines that bankrupt small businesses (mark your calendar)', angle: 'Urgent Warning', selected: true }
    ],
    drafts: [
      { version: 1, text: 'Small business tax calendar.', createdAt: { seconds: 1673308800, nanoseconds: 0 }, generatedByAI: true }
    ]
  }
];
