import React, { createContext, useContext, useState, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Type for a profile card (subClient)
export type ProfileCard = {
  id: string;
  profileName: string;
  status?: string;
  role?: string;
  onboardingLink?: string; // Optional field for onboarding link
  createdAt?: Date; // Optional field for creation date
};

interface ProfilesContextType {
  profiles: ProfileCard[];
  loading: boolean;
  error: string | null;
  fetchProfiles: (clientId: string) => Promise<void>;
  addProfile: (
    clientId: string,
    profile: {
      id: string;
      profileName: string;
      role: string;
      status: string;
      onboardingLink: string;
      createdAt: Date;
      clientId: string;
    }
  ) => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextType>({
  profiles: [],
  loading: false,
  error: null,
  fetchProfiles: async () => {},
  addProfile: async () => {},
});

export const useProfiles = () => useContext(ProfilesContext);

export const ProfilesProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const subClientsRef = collection(
        db,
        'agencies',
        'agency1',
        'clients',
        clientId,
        'subClients'
      );
      const snapshot = await getDocs(subClientsRef);
      const fetchedProfiles: ProfileCard[] = snapshot.docs.map(doc => ({
        id: doc.id,
        profileName: doc.data().profileName || '',
        status: doc.data().status || '',
        role: doc.data().role || '',
      }));
      setProfiles(fetchedProfiles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profiles');
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const addProfile = async (
    clientId: string,
    profile: {
      id: string;
      profileName: string;
      role: string;
      status: string;
      onboardingLink: string;
      createdAt: Date;
      clientId: string;
    }
  ) => {
    try {
      const profileRef = doc(
        db,
        'agencies',
        'agency1',
        'clients',
        clientId,
        'subClients',
        profile.id
      );
      await setDoc(profileRef, {
        profileName: profile.profileName,
        role: profile.role,
        status: profile.status,
        onboardingLink: profile.onboardingLink,
        createdAt: profile.createdAt,
        clientId: profile.clientId,
      });
      await fetchProfiles(clientId);
    } catch (err) {
      console.error('[ProfilesContext] Error adding profile:', err);
    }
  };

  return (
    <ProfilesContext.Provider value={{ profiles, loading, error, fetchProfiles, addProfile }}>
      {children}
    </ProfilesContext.Provider>
  );
};