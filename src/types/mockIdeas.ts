
import { Idea } from './interfaces';

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
