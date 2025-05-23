
import { Client } from './interfaces';

export const mockClients: Client[] = [
  {
    id: 'client1',
    clientName: 'Tech Solutions Inc.',
    industry: 'Technology',
    contactName: 'John Doe',
    contactEmail: 'john.doe@techsolutions.com',
    status: 'active',
    brandBriefSummary: 'Leading technology solutions provider specializing in enterprise software.',
    writingStyle: 'Professional and informative',
    createdAt: { seconds: 1669852800, nanoseconds: 0 },
    updatedAt: { seconds: 1672531200, nanoseconds: 0 },
    brandProfile: {
      language: 'English',
      locationFocus: 'Global',
      businessSize: 'Enterprise',
      sellsWhat: 'Enterprise software solutions',
      sellsToWhom: 'Large businesses and corporations',
      brandPersonality: ['Professional', 'Innovative', 'Reliable'],
      brandTone: 'Authoritative yet approachable',
      emotionsToEvoke: ['Trust', 'Confidence', 'Innovation'],
      emojiUsage: 'Minimal',
      desiredPostLength: 'Medium (150-300 words)',
      coreValues: 'Innovation, reliability, customer success',
      brandStory: 'Founded in 2010, Tech Solutions Inc. has been at the forefront of enterprise technology.',
      uniqueSellingProposition: 'The only platform that combines AI with traditional enterprise tools',
      hotTakesOrOpinions: 'AI will replace 80% of current software interfaces within 5 years',
      missionStatement: 'To democratize enterprise technology for businesses of all sizes',
      inspirationSources: 'Industry leaders, customer feedback, emerging technologies',
      recentCompanyEvents: 'Recently launched AI-powered analytics platform',
      linkedinProfileUrl: 'https://linkedin.com/company/tech-solutions-inc',
      trainingDataUrls: ['https://example.com/blog1', 'https://example.com/blog2'],
      customInstructionsAI: 'Always mention ROI and business impact'
    },
    aiTraining: {
      status: 'completed',
      lastTrainedAt: { seconds: 1672444800, nanoseconds: 0 },
      modelVersion: 'v2.1'
    }
  },
  {
    id: 'client2',
    clientName: 'Global Marketing Corp',
    industry: 'Marketing',
    contactName: 'Jane Smith',
    contactEmail: 'jane.smith@globalmarketing.com',
    status: 'onboarding',
    brandBriefSummary: 'Full-service marketing agency helping brands grow their digital presence.',
    writingStyle: 'Creative and engaging',
    createdAt: { seconds: 1669939200, nanoseconds: 0 },
    updatedAt: { seconds: 1672444800, nanoseconds: 0 },
    brandProfile: {
      language: 'English',
      locationFocus: 'North America',
      businessSize: 'Mid-market',
      sellsWhat: 'Marketing services and consulting',
      sellsToWhom: 'SMBs and mid-market companies',
      brandPersonality: ['Creative', 'Bold', 'Results-driven'],
      brandTone: 'Friendly and energetic',
      emotionsToEvoke: ['Excitement', 'Inspiration', 'Confidence'],
      emojiUsage: 'Strategic',
      desiredPostLength: 'Short to medium (100-250 words)',
      coreValues: 'Creativity, results, client partnership',
      brandStory: 'Started as a boutique agency, now serving hundreds of clients worldwide.',
      uniqueSellingProposition: 'Data-driven creativity that delivers measurable results',
      hotTakesOrOpinions: 'Traditional advertising is dead, long live content marketing',
      missionStatement: 'To help every business tell their story in a way that resonates',
      inspirationSources: 'Pop culture, social trends, client successes',
      recentCompanyEvents: 'Won Agency of the Year award 2023',
      linkedinProfileUrl: 'https://linkedin.com/company/global-marketing-corp',
      trainingDataUrls: ['https://example.com/case-studies'],
      customInstructionsAI: 'Include relevant hashtags and call-to-actions'
    },
    aiTraining: {
      status: 'training_queued',
      lastTrainedAt: { seconds: 0, nanoseconds: 0 }
    }
  },
];
