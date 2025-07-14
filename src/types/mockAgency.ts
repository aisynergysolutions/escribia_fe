
import { Agency } from './interfaces';
import { Timestamp } from 'firebase/firestore';

export const mockAgency: Agency = {
  id: 'agency1',
  agencyName: 'Acme Media Agency',
  primaryContactEmail: 'hello@acme.com',
  subscription: {
    status: 'active',
    planId: 'pro_plan',
    stripeCustomerId: 'cus_example123',
    currentPeriodEnd: Timestamp.fromMillis(1703980800 * 1000), // Dec 31, 2023
    createdAtSubscription: Timestamp.fromMillis(1672531200 * 1000), // Jan 1, 2023
    paymentHistory: [
      {
        paymentDate: Timestamp.fromMillis(1672531200 * 1000),
        amount: 99.00,
        transactionId: 'txn_123456789'
      },
      {
        paymentDate: Timestamp.fromMillis(1675209600 * 1000),
        amount: 99.00,
        transactionId: 'txn_987654321'
      }
    ]
  },
  createdAtAgency: Timestamp.fromMillis(1672531200 * 1000),
  updatedAt: Timestamp.fromMillis(1672617600 * 1000),
  settings: {
    defaultLanguage: 'en',
    timezone: 'Europe/Madrid'
  },
  apiUsage: {
    postsGeneratedThisMonth: 42,
    clientsManagedCount: 8,
    lastCalculationDate: Timestamp.fromMillis(1672531200 * 1000)
  },
  referral: {
    code: 'REF-ACME42',
    balance: 125,
    source: 'partner'
  },
  successfulExecutions: 487,
  adminNotes: 'Premium customer, excellent feedback'
};
