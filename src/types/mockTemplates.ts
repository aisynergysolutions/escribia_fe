
import { Template } from './interfaces';
import { Timestamp } from 'firebase/firestore';

export const mockTemplates: Template[] = [
  {
    id: 'template1',
    templateName: 'Thought Leadership Post',
    templateContent: 'In my experience working with [industry], I\'ve found that [insight]. This has led me to believe that [opinion]. What do you think? Has your experience been similar?',
    objective: 'Thought Leadership',
    funnelStage: 'TOFU',
    contentType: 'text',
    scope: 'agency_specific',
    agencyId: 'agency1',
    createdAt: Timestamp.fromMillis(1714416000 * 1000),
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
    agencyId: 'agency1',
    createdAt: Timestamp.fromMillis(1714329600 * 1000),
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
    agencyId: 'agency1',
    createdAt: Timestamp.fromMillis(1714243200 * 1000),
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
