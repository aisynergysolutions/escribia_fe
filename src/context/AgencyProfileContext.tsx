import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

type PaymentHistoryItem = {
  paymentDate: { seconds: number };
  amount: number;
  transactionId: string;
};

type Subscription = {
  planId: string;
  paymentHistory: PaymentHistoryItem[];
};

type AgencyProfile = {
  agencyName: string;
  mainAdminName: string;
  phoneNumber: string;
  photoUrl: string;
  primaryContactEmail: string;
  settings: {
    defaultLanguage: string;
    timezone: string;
  };
  updatedAt: string;
  agencySize: string;
  website: string;
  subscription: Subscription;
};

type AgencyProfileContextType = {
  profile: AgencyProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (agencyId: string) => Promise<void>;
  updateProfile: (agencyId: string, updates: Partial<AgencyProfile>) => Promise<void>;
};

const AgencyProfileContext = createContext<AgencyProfileContextType>({
  profile: null,
  loading: false,
  error: null,
  fetchProfile: async () => {},
  updateProfile: async () => {},
});

export const useAgencyProfile = () => useContext(AgencyProfileContext);

export const AgencyProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (agencyId: string) => {
    // console.log('[AgencyProfileContext] fetchProfile called with agencyId:', agencyId);
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'agencies', agencyId);
      // console.log('[AgencyProfileContext] Fetching document from Firestore:', docRef.path);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.warn('[AgencyProfileContext] Agency not found:', agencyId);
        setError('Agency not found');
        setProfile(null);
        setLoading(false);
        return;
      }
      // console.log('[AgencyProfileContext] Fetched agency profile document:', docSnap.id);
      const data = docSnap.data();
      let photoUrl = data.photoUrl || '';
      if (photoUrl && !photoUrl.startsWith('http')) {
        try {
          // console.log('[AgencyProfileContext] Resolving photoUrl from storage:', photoUrl);
          photoUrl = await getDownloadURL(ref(storage, photoUrl));
        } catch (e) {
          console.warn('[AgencyProfileContext] Failed to get download URL for photoUrl:', photoUrl, e);
          photoUrl = '';
        }
      }
      // Prepare the profile object
      const fetchedProfile: AgencyProfile = {
        mainAdminName: data.mainAdminName || '',
        phoneNumber: data.phoneNumber || '',
        photoUrl,
        primaryContactEmail: data.primaryContactEmail || '',
        settings: {
          defaultLanguage: data.settings?.defaultLanguage || '',
          timezone: data.settings?.timezone || '',
        },
        updatedAt: data.updatedAt || '',
        agencyName: data.agencyName || '',
        agencySize: data.agencySize || '',
        website: data.agencyWebsite || '',
        subscription: {
          planId: data.subscription?.planId || '',
          paymentHistory: Array.isArray(data.subscription?.paymentHistory)
            ? data.subscription.paymentHistory.map((item: any) => ({
                paymentDate: item.paymentDate || { seconds: 0 },
                amount: item.amount || 0,
                transactionId: item.transactionId || '',
              }))
            : [],
        },
      };
      // console.log('[AgencyProfileContext] Fetched agency profile:', fetchedProfile);
      setProfile(fetchedProfile);
    } catch (err: any) {
      console.error('[AgencyProfileContext] Error fetching agency profile:', err);
      setError(err.message || 'Error fetching agency profile');
      setProfile(null);
    }
    setLoading(false);
  };

  const updateProfile = async (agencyId: string, updates: Partial<AgencyProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'agencies', agencyId);
      let photoUrl = updates.photoUrl;

      // If the photo is a base64 string, upload it to the correct storage path
      if (photoUrl && photoUrl.startsWith('data:')) {
        const storageRef = ref(storage, `agencies/${agencyId}/agencyProfile/profilePicture`);
        await uploadString(storageRef, photoUrl, 'data_url');
        photoUrl = await getDownloadURL(storageRef);
      }

      // Prepare settings, removing undefined fields
      let settings: any = {};
      if (updates.settings) {
        if (updates.settings.defaultLanguage !== undefined) {
          settings.defaultLanguage = updates.settings.defaultLanguage;
        }
        if (updates.settings.timezone !== undefined) {
          settings.timezone = updates.settings.timezone;
        }
      }

      const updateData: any = {
        agencyName: updates.agencyName,
        agencyWebsite: updates.website,
        mainAdminName: updates.mainAdminName,
        primaryContactEmail: updates.primaryContactEmail,
        phoneNumber: updates.phoneNumber,
        photoUrl: photoUrl,
        agencySize: updates.agencySize,
        updatedAt: new Date().toISOString(),
      };

      // Only add settings if it has at least one property
      if (Object.keys(settings).length > 0) {
        updateData.settings = settings;
      }

      // Remove undefined fields from updateData
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await updateDoc(docRef, updateData);
      await fetchProfile(agencyId); // Refresh profile
    } catch (err: any) {
      setError(err.message || 'Error updating agency profile');
    }
    setLoading(false);
  };

  useEffect(() => {
    // console.log('[AgencyProfileContext] Provider mounted, calling fetchProfile');
    fetchProfile('agency1');
  }, []);

  return (
    <AgencyProfileContext.Provider value={{ profile, loading, error, fetchProfile, updateProfile }}>
      {children}
    </AgencyProfileContext.Provider>
  );
};