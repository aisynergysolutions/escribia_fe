
import { Client } from './interfaces';
import { Timestamp } from 'firebase/firestore';

export const mockClients: Client[] = [
  {
    id: 'client1',
    onboarding_link: 'https://tally.so/r/mg1X3N',
    clientName: 'Tech Solutions Inc.',
    industry: 'Technology',
    contactName: 'John Doe',
    contactEmail: 'john.doe@techsolutions.com',
    status: 'active',
    brandBriefSummary: 'Leading technology solutions provider specializing in enterprise software.',
    writingStyle: 'Professional and informative',
    createdAt: Timestamp.fromMillis(1669852800 * 1000),
    updatedAt: Timestamp.fromMillis(1672531200 * 1000),
    subClients: [
      {
        id: 'subclient1_company',
        name: 'Tech Solutions Inc.',
        role: 'Company',
        linkedinConnected: true,
        linkedinAccountName: 'Tech Solutions Inc.',
        linkedinExpiryDate: 'June 15, 2025',
        writingStyle: 'Professional and informative',
        customInstructions: 'Always mention ROI and business impact',
        createdAt: Timestamp.fromMillis(1669852800 * 1000)
      },
      {
        id: 'subclient1_ceo',
        name: 'John Doe',
        role: 'CEO',
        linkedinConnected: false,
        writingStyle: 'Authoritative and visionary',
        customInstructions: 'Focus on industry leadership and innovation',
        createdAt: Timestamp.fromMillis(1669852800 * 1000)
      }
    ],
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
      lastTrainedAt: Timestamp.fromMillis(1672444800 * 1000),
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
    createdAt: Timestamp.fromMillis(1669939200 * 1000),
    updatedAt: Timestamp.fromMillis(1672444800 * 1000),
    subClients: [
      {
        id: 'subclient2_company',
        name: 'Global Marketing Corp',
        role: 'Company',
        linkedinConnected: false,
        createdAt: Timestamp.fromMillis(1669939200 * 1000)
      }
    ],
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
      lastTrainedAt: Timestamp.fromMillis(0 * 1000)
    }
  },
  {
    id: 'client3',
    clientName: 'HealthFirst Medical',
    industry: 'Healthcare',
    contactName: 'Dr. Sarah Johnson',
    contactEmail: 'sarah.johnson@healthfirst.com',
    status: 'active',
    brandBriefSummary: 'Innovative healthcare provider focused on patient-centered care and medical technology.',
    writingStyle: 'Compassionate and educational',
    createdAt: Timestamp.fromMillis(1670112000 * 1000),
    updatedAt: Timestamp.fromMillis(1672617600 * 1000),
    subClients: [
      {
        id: 'subclient3_company',
        name: 'HealthFirst Medical',
        role: 'Company',
        linkedinConnected: true,
        linkedinAccountName: 'HealthFirst Medical',
        linkedinExpiryDate: 'August 20, 2025',
        createdAt: Timestamp.fromMillis(1670112000 * 1000)
      }
    ],
    brandProfile: {
      language: 'English',
      locationFocus: 'United States',
      businessSize: 'Enterprise',
      sellsWhat: 'Healthcare services and medical technology',
      sellsToWhom: 'Patients and healthcare professionals',
      brandPersonality: ['Caring', 'Professional', 'Innovative'],
      brandTone: 'Empathetic and trustworthy',
      emotionsToEvoke: ['Trust', 'Hope', 'Confidence'],
      emojiUsage: 'Thoughtful',
      desiredPostLength: 'Medium (200-350 words)',
      coreValues: 'Patient care, innovation, integrity',
      brandStory: 'Founded by physicians who believed technology could improve patient outcomes.',
      uniqueSellingProposition: 'Combining human touch with cutting-edge medical technology',
      hotTakesOrOpinions: 'Telemedicine will become the primary care delivery method',
      missionStatement: 'To make quality healthcare accessible to everyone',
      inspirationSources: 'Medical research, patient stories, healthcare innovations',
      recentCompanyEvents: 'Opened three new telehealth centers',
      linkedinProfileUrl: 'https://linkedin.com/company/healthfirst-medical',
      trainingDataUrls: ['https://example.com/medical-blog'],
      customInstructionsAI: 'Always prioritize patient safety and evidence-based information'
    },
    aiTraining: {
      status: 'completed',
      lastTrainedAt: Timestamp.fromMillis(1672531200 * 1000),
      modelVersion: 'v2.0'
    }
  },
  {
    id: 'client4',
    clientName: 'EcoGreen Solutions',
    industry: 'Sustainability',
    contactName: 'Michael Green',
    contactEmail: 'michael@ecogreen.com',
    status: 'active',
    brandBriefSummary: 'Environmental consulting firm helping businesses reduce their carbon footprint.',
    writingStyle: 'Passionate and informative',
    createdAt: Timestamp.fromMillis(1670198400 * 1000),
    updatedAt: Timestamp.fromMillis(1672704000 * 1000),
    subClients: [
      {
        id: 'subclient4_company',
        name: 'EcoGreen Solutions',
        role: 'Company',
        linkedinConnected: false,
        createdAt: Timestamp.fromMillis(1670198400 * 1000)
      }
    ],
    brandProfile: {
      language: 'English',
      locationFocus: 'Global',
      businessSize: 'Small',
      sellsWhat: 'Environmental consulting and sustainability solutions',
      sellsToWhom: 'Businesses and organizations',
      brandPersonality: ['Passionate', 'Knowledgeable', 'Forward-thinking'],
      brandTone: 'Inspiring and urgent',
      emotionsToEvoke: ['Responsibility', 'Hope', 'Urgency'],
      emojiUsage: 'Nature-focused',
      desiredPostLength: 'Medium (150-300 words)',
      coreValues: 'Environmental protection, sustainability, education',
      brandStory: 'Started by environmental scientists committed to fighting climate change.',
      uniqueSellingProposition: 'Practical sustainability solutions that actually work',
      hotTakesOrOpinions: 'Carbon neutrality is not enough - we need carbon negative businesses',
      missionStatement: 'To create a sustainable future for generations to come',
      inspirationSources: 'Environmental research, climate data, success stories',
      recentCompanyEvents: 'Helped 50 companies achieve carbon neutrality',
      linkedinProfileUrl: 'https://linkedin.com/company/ecogreen-solutions',
      trainingDataUrls: ['https://example.com/sustainability-reports'],
      customInstructionsAI: 'Focus on actionable environmental solutions'
    },
    aiTraining: {
      status: 'completed',
      lastTrainedAt: Timestamp.fromMillis(1672617600 * 1000),
      modelVersion: 'v2.1'
    }
  },
  {
    id: 'client5',
    clientName: 'FinanceFlow Pro',
    industry: 'Financial Services',
    contactName: 'Lisa Chen',
    contactEmail: 'lisa.chen@financeflow.com',
    status: 'paused',
    brandBriefSummary: 'Modern financial planning platform for small business owners and entrepreneurs.',
    writingStyle: 'Clear and trustworthy',
    createdAt: Timestamp.fromMillis(1670284800 * 1000),
    updatedAt: Timestamp.fromMillis(1672790400 * 1000),
    subClients: [
      {
        id: 'subclient5_company',
        name: 'FinanceFlow Pro',
        role: 'Company',
        linkedinConnected: false,
        createdAt: Timestamp.fromMillis(1670284800 * 1000)
      }
    ],
    brandProfile: {
      language: 'English',
      locationFocus: 'North America',
      businessSize: 'Mid-market',
      sellsWhat: 'Financial planning software and services',
      sellsToWhom: 'Small business owners and entrepreneurs',
      brandPersonality: ['Trustworthy', 'Clear', 'Supportive'],
      brandTone: 'Professional and reassuring',
      emotionsToEvoke: ['Security', 'Confidence', 'Empowerment'],
      emojiUsage: 'Professional',
      desiredPostLength: 'Short to medium (100-250 words)',
      coreValues: 'Financial literacy, transparency, empowerment',
      brandStory: 'Built by entrepreneurs who struggled with financial planning themselves.',
      uniqueSellingProposition: 'Financial planning made simple for busy entrepreneurs',
      hotTakesOrOpinions: 'Traditional financial advisors are becoming obsolete',
      missionStatement: 'To democratize financial planning for all business owners',
      inspirationSources: 'Economic trends, customer feedback, financial research',
      recentCompanyEvents: 'Launched AI-powered financial forecasting tool',
      linkedinProfileUrl: 'https://linkedin.com/company/financeflow-pro',
      trainingDataUrls: ['https://example.com/financial-guides'],
      customInstructionsAI: 'Always include practical financial advice'
    },
    aiTraining: {
      status: 'pending_data',
      lastTrainedAt: Timestamp.fromMillis(0 * 1000)
    }
  },
  {
    id: 'client6',
    clientName: 'BuildRight Construction',
    industry: 'Construction',
    contactName: 'Robert Martinez',
    contactEmail: 'robert@buildright.com',
    status: 'onboarding',
    brandBriefSummary: 'Premium construction company specializing in sustainable building practices.',
    writingStyle: 'Straightforward and reliable',
    createdAt: Timestamp.fromMillis(1670371200 * 1000),
    updatedAt: Timestamp.fromMillis(1672876800 * 1000),
    subClients: [
      {
        id: 'subclient6_company',
        name: 'BuildRight Construction',
        role: 'Company',
        linkedinConnected: false,
        createdAt: Timestamp.fromMillis(1670371200 * 1000)
      }
    ],
    brandProfile: {
      language: 'English',
      locationFocus: 'Regional',
      businessSize: 'Small',
      sellsWhat: 'Construction and renovation services',
      sellsToWhom: 'Homeowners and commercial property owners',
      brandPersonality: ['Reliable', 'Experienced', 'Quality-focused'],
      brandTone: 'Honest and dependable',
      emotionsToEvoke: ['Trust', 'Confidence', 'Pride'],
      emojiUsage: 'Minimal',
      desiredPostLength: 'Short (50-150 words)',
      coreValues: 'Quality, reliability, sustainability',
      brandStory: 'Family-owned business with three generations of construction expertise.',
      uniqueSellingProposition: 'Premium quality construction with sustainable practices',
      hotTakesOrOpinions: 'Green building should be the standard, not the exception',
      missionStatement: 'To build lasting structures that serve communities for generations',
      inspirationSources: 'Architectural trends, customer projects, sustainable materials',
      recentCompanyEvents: 'Completed first net-zero energy building',
      linkedinProfileUrl: 'https://linkedin.com/company/buildright-construction',
      trainingDataUrls: ['https://example.com/construction-blog'],
      customInstructionsAI: 'Emphasize quality and craftsmanship'
    },
    aiTraining: {
      status: 'training_queued',
      lastTrainedAt: Timestamp.fromMillis(0 * 1000)
    }
  }
];
