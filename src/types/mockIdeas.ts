import { Idea } from './index';

export const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI in Modern Marketing',
    initialIdeaPrompt: 'Exploring how artificial intelligence is transforming marketing strategies and customer engagement in 2024.',
    objective: 'educate',
    status: 'Draft',
    clientId: '1',
    createdAt: new Date('2023-12-15T10:30:00'),
    updatedAt: new Date('2023-12-15T14:20:00'),
    currentDraftText: 'The future of marketing lies in the seamless integration of artificial intelligence...',
    templateUsedId: 'educational-post',
    internalNotes: 'Focus on practical applications rather than theory',
    generatedHooks: [
      {
        text: "🤖 AI isn't just the future of marketing—it's happening right now, and it's changing everything we thought we knew about customer engagement.",
        angle: "Present moment urgency with future implications"
      },
      {
        text: "While you're still manually segmenting your email lists, your competitors are using AI to predict what your customers want before they even know it themselves.",
        angle: "Competitive advantage through predictive analytics"
      },
      {
        text: "The biggest marketing breakthrough isn't a new platform or strategy—it's teaching machines to understand human emotions better than we do.",
        angle: "Emotional intelligence meets artificial intelligence"
      },
      {
        text: "Remember when 'personalization' meant adding someone's first name to an email? AI has made that approach look like writing with a crayon.",
        angle: "Evolution of personalization technology"
      },
      {
        text: "Every scroll, click, and pause your customers make is data—and AI is finally smart enough to turn those breadcrumbs into a roadmap to their wallet.",
        angle: "Behavioral data interpretation and monetization"
      }
    ]
  },
  {
    id: '2',
    title: 'Social Media Engagement Tips',
    initialIdeaPrompt: 'Best practices for increasing engagement rates on social media platforms.',
    objective: 'engage',
    status: 'Published',
    clientId: '1',
    createdAt: new Date('2023-12-14T09:15:00'),
    updatedAt: new Date('2023-12-14T16:45:00'),
    currentDraftText: 'Engagement is the currency of social media...',
    templateUsedId: 'engagement-post',
    generatedHooks: [
      {
        text: "Your engagement rate is dropping not because your content is bad, but because you're still playing by 2019's rules in 2024's game.",
        angle: "Platform evolution and outdated strategies"
      },
      {
        text: "The accounts getting millions of views aren't posting more content—they're posting more content, and here's exactly what they're doing differently.",
        angle: "Quality over quantity with strategic insights"
      },
      {
        text: "Stop chasing the algorithm. Start chasing genuine human connection, and watch the algorithm chase you instead.",
        angle: "Authentic engagement vs. gaming the system"
      },
      {
        text: "The difference between 100 likes and 100,000 likes isn't budget or luck—it's understanding one simple psychological trigger most creators ignore.",
        angle: "Psychology-driven content strategy"
      }
    ]
  },
  {
    id: '3',
    title: 'Content Calendar Strategy',
    initialIdeaPrompt: 'How to create and maintain an effective content calendar for consistent posting.',
    objective: 'educate',
    status: 'Idea',
    clientId: '2',
    createdAt: new Date('2023-12-13T14:22:00'),
    updatedAt: new Date('2023-12-13T14:22:00'),
    currentDraftText: '',
    generatedHooks: [
      {
        text: "Your content calendar is either your secret weapon or your creative prison—and the difference comes down to how you build it.",
        angle: "Strategic planning vs. restrictive structure"
      },
      {
        text: "The most successful content creators don't plan their posts day by day—they think in themes, seasons, and customer journey stages.",
        angle: "Strategic content architecture approach"
      },
      {
        text: "While you're scrambling for 'what to post today,' your competitors planned this moment three months ago and are already measuring its success.",
        angle: "Preparation advantage and competitive edge"
      },
      {
        text: "A content calendar without a content strategy is just a pretty to-do list that leads to burnout instead of breakthrough.",
        angle: "Strategy foundation before tactical execution"
      },
      {
        text: "The best content calendars aren't filled with posts—they're filled with conversations you want to start and problems you want to solve.",
        angle: "Purpose-driven content planning"
      }
    ]
  },
  {
    id: '4',
    title: 'Brand Voice Development',
    initialIdeaPrompt: 'Developing a consistent and authentic brand voice across all communication channels.',
    objective: 'educate',
    status: 'In Review',
    clientId: '2',
    createdAt: new Date('2023-12-12T11:45:00'),
    updatedAt: new Date('2023-12-12T15:30:00'),
    currentDraftText: 'Your brand voice is more than just words...',
    templateUsedId: 'brand-guide',
    internalNotes: 'Include examples from successful brands',
    generatedHooks: [
      {
        text: "Your brand doesn't have a voice problem—it has a personality crisis, and your customers can feel the confusion in every message you send.",
        angle: "Brand identity clarity and consistency issues"
      },
      {
        text: "The brands people remember aren't the ones that sound professional—they're the ones that sound like the friend you actually want to have.",
        angle: "Authenticity over corporate formality"
      },
      {
        text: "You can copy a competitor's strategy, design, even their pricing—but you can't copy their voice, and that's exactly why it's your biggest competitive advantage.",
        angle: "Voice as unique differentiator"
      },
      {
        text: "Your brand voice isn't what you say—it's how people feel when they hear you say it, and that feeling decides whether they buy or walk away.",
        angle: "Emotional impact of brand communication"
      }
    ]
  },
  {
    id: '5',
    title: 'Video Marketing Trends',
    initialIdeaPrompt: 'Latest trends in video marketing and how to leverage them for business growth.',
    objective: 'inform',
    status: 'Draft',
    clientId: '3',
    createdAt: new Date('2023-12-11T16:10:00'),
    updatedAt: new Date('2023-12-11T17:25:00'),
    currentDraftText: 'Video content continues to dominate...',
    generatedHooks: [
      {
        text: "Video marketing isn't about having the best camera—it's about having the best story, and most brands are telling theirs completely backwards.",
        angle: "Storytelling technique over production quality"
      },
      {
        text: "The video trends getting millions of views today will be dead in six months, but the psychology behind why they worked will be relevant forever.",
        angle: "Timeless principles vs. fleeting trends"
      },
      {
        text: "Short-form video didn't kill long-form content—it killed boring content, and there's a huge difference between the two.",
        angle: "Content quality evolution through format changes"
      },
      {
        text: "Every successful video marketer knows this secret: people don't watch videos, they watch other people, and your content strategy should reflect that truth.",
        angle: "Human-centric video content approach"
      },
      {
        text: "The biggest video marketing mistake isn't bad lighting or poor audio—it's making videos for algorithms instead of making them for humans.",
        angle: "Human connection vs. algorithmic optimization"
      }
    ]
  },
  {
    id: '6',
    title: 'Email Marketing Automation',
    initialIdeaPrompt: 'Setting up effective email marketing automation sequences for different customer journeys.',
    objective: 'educate',
    status: 'Published',
    clientId: '3',
    createdAt: new Date('2023-12-10T13:20:00'),
    updatedAt: new Date('2023-12-10T18:50:00'),
    currentDraftText: 'Email automation is the backbone of modern marketing...',
    templateUsedId: 'how-to-guide',
    generatedHooks: [
      {
        text: "Your email automation is either nurturing relationships or destroying them—and most businesses don't realize which one they're doing until it's too late.",
        angle: "Relationship building vs. relationship damage"
      },
      {
        text: "The difference between email marketing that converts and email marketing that gets deleted isn't the subject line—it's whether you understand the difference between selling and serving.",
        angle: "Service-oriented vs. sales-oriented messaging"
      },
      {
        text: "Email automation that works doesn't feel automated—it feels like getting advice from a friend who happens to know exactly what you need to hear.",
        angle: "Personalization and timing in automated sequences"
      },
      {
        text: "While you're sending the same email to everyone on your list, your competitors are sending different emails to different people based on their behavior, and guess who's winning?",
        angle: "Behavioral segmentation competitive advantage"
      }
    ]
  }
];
