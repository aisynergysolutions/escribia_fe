import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const checkAgencyOnboardingStatus = async (agencyId: string): Promise<boolean> => {
  try {
    const agencyDoc = await getDoc(doc(db, 'agencies', agencyId));
    
    if (!agencyDoc.exists()) {
      return false; // No agency document exists
    }
    
    const data = agencyDoc.data();
    return data.onboardingCompleted === true;
  } catch (error) {
    console.error('Error checking agency onboarding status:', error);
    return false;
  }
};