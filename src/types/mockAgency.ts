
import { Agency } from './interfaces';

export const mockAgency: Agency = {
  id: 'agency1',
  agencyName: 'Acme Media Agency',
  primaryContactEmail: 'hello@acme.com',
  subscription: {
    status: 'active',
    planId: 'pro_plan',
    stripeCustomerId: 'cus_example123',
    currentPeriodEnd: { seconds: 1703980800, nanoseconds: 0 }, // Dec 31, 2023
    createdAtSubscription: { seconds: 1672531200, nanoseconds: 0 }, // Jan 1, 2023
    paymentHistory: [
      {
        paymentDate: { seconds: 1672531200, nanoseconds: 0 },
        amount: 99.00,
        transactionId: 'txn_123456789'
      },
      {
        paymentDate: { seconds: 1675209600, nanoseconds: 0 },
        amount: 99.00,
        transactionId: 'txn_987654321'
      }
    ]
  },
  createdAtAgency: { seconds: 1672531200, nanoseconds: 0 },
  updatedAt: { seconds: 1672617600, nanoseconds: 0 },
  settings: {
    defaultLanguage: 'en',
    timezone: 'Europe/Madrid'
  },
  apiUsage: {
    postsGeneratedThisMonth: 42,
    clientsManagedCount: 8,
    lastCalculationDate: { seconds: 1672531200, nanoseconds: 0 }
  },
  referral: {
    code: 'REF-ACME42',
    balance: 125,
    source: 'partner'
  },
  successfulExecutions: 487,
  adminNotes: 'Premium customer, excellent feedback'
};
