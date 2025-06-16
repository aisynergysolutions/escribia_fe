
import { LinkedInAccount } from './linkedinAccount';

export const mockLinkedInAccounts: LinkedInAccount[] = [
  {
    id: 'account_1',
    clientId: 'client1',
    accountName: 'TechCorp Official',
    accountType: 'company',
    linkedinProfileUrl: 'https://linkedin.com/company/techcorp',
    isConnected: true,
    connectionStatus: 'connected',
    connectionExpiresAt: { seconds: Math.floor(Date.now() / 1000) + 2592000, nanoseconds: 0 }, // 30 days
    displayName: 'TechCorp',
    writingStyle: 'Professional and innovative',
    brandPersonality: ['Professional', 'Innovative', 'Forward-thinking'],
    brandTone: 'Authoritative yet approachable',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    lastUsedAt: { seconds: Math.floor(Date.now() / 1000) - 3600, nanoseconds: 0 },
    totalPosts: 45,
    lastPostAt: { seconds: Math.floor(Date.now() / 1000) - 3600, nanoseconds: 0 }
  },
  {
    id: 'account_2',
    clientId: 'client1',
    accountName: 'Sarah Johnson - CEO',
    accountType: 'executive',
    linkedinProfileUrl: 'https://linkedin.com/in/sarah-johnson-ceo',
    isConnected: true,
    connectionStatus: 'connected',
    connectionExpiresAt: { seconds: Math.floor(Date.now() / 1000) + 2592000, nanoseconds: 0 },
    displayName: 'Sarah Johnson',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b547?w=150',
    writingStyle: 'Personal yet professional, thought leadership',
    brandPersonality: ['Visionary', 'Authentic', 'Inspiring'],
    brandTone: 'Personal and inspiring',
    customInstructions: 'Focus on leadership insights and company vision',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    lastUsedAt: { seconds: Math.floor(Date.now() / 1000) - 7200, nanoseconds: 0 },
    totalPosts: 23,
    lastPostAt: { seconds: Math.floor(Date.now() / 1000) - 7200, nanoseconds: 0 }
  },
  {
    id: 'account_3',
    clientId: 'client2',
    accountName: 'GreenTech Solutions',
    accountType: 'company',
    linkedinProfileUrl: 'https://linkedin.com/company/greentech-solutions',
    isConnected: false,
    connectionStatus: 'disconnected',
    displayName: 'GreenTech Solutions',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 },
    totalPosts: 0
  },
  {
    id: 'account_4',
    clientId: 'client2',
    accountName: 'Marketing Department',
    accountType: 'department',
    linkedinProfileUrl: 'https://linkedin.com/company/greentech-marketing',
    isConnected: true,
    connectionStatus: 'expired',
    connectionExpiresAt: { seconds: Math.floor(Date.now() / 1000) - 86400, nanoseconds: 0 }, // expired yesterday
    displayName: 'GreenTech Marketing',
    writingStyle: 'Engaging and educational',
    brandPersonality: ['Educational', 'Engaging', 'Eco-conscious'],
    brandTone: 'Friendly and informative',
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 172800, nanoseconds: 0 },
    updatedAt: { seconds: Math.floor(Date.now() / 1000) - 3600, nanoseconds: 0 },
    totalPosts: 12,
    lastPostAt: { seconds: Math.floor(Date.now() / 1000) - 172800, nanoseconds: 0 }
  }
];
