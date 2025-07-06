import React, { createContext, useContext, useState, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ProfileCard = {
  id: string;
  profileName: string;
  status?: string;
  role?: string;
  profileType?: string; // Optional, if you want to include profileType
  onboardingLink?: string;
  createdAt?: Date;
};

interface ProfilesContextType {
  profiles: ProfileCard[];
  loading: boolean;
  error: string | null;
  fetchProfiles: (clientId: string, force?: boolean) => Promise<void>;
  addProfile: (
    clientId: string,
    profile: {
      id: string;
      profileName: string;
      role: string;
      profileType?: string; // Optional, if you want to include profileType
      status: string;
      onboardingLink: string;
      createdAt: Date;
      clientId: string;
    }
  ) => Promise<void>;
  deleteProfile: (clientId: string, profileId: string) => Promise<void>;
  setActiveClientId: (clientId: string) => void;
}

const ProfilesContext = createContext<ProfilesContextType>({
  profiles: [],
  loading: false,
  error: null,
  fetchProfiles: async () => {},
  addProfile: async () => {},
  deleteProfile: async () => {},
  setActiveClientId: () => {},
});

export const useProfiles = () => useContext(ProfilesContext);

export const ProfilesProvider = ({ children }: { children: ReactNode }) => {
  // Store profiles by clientId
  const [profilesByClient, setProfilesByClient] = useState<Record<string, ProfileCard[]>>({});
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expose only the profiles for the active client
  const profiles = activeClientId ? profilesByClient[activeClientId] || [] : [];

  // Fetch only if not cached, unless force is true
  const fetchProfiles = async (clientId: string, force = false) => {
    if (!force && profilesByClient[clientId]) {
      return;
    }
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
        profileType: doc.data().profileType || '', // Optional, if you want to include profileType
        onboardingLink: doc.data().onboardingLink || '',
        createdAt: doc.data().createdAt
          ? new Date(
              doc.data().createdAt.seconds
                ? doc.data().createdAt.seconds * 1000
                : doc.data().createdAt
            )
          : undefined,
      }));
      setProfilesByClient(prev => ({
        ...prev,
        [clientId]: fetchedProfiles,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profiles');
      setProfilesByClient(prev => ({
        ...prev,
        [clientId]: [],
      }));
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
      profileType?: string; // Optional, if you want to include profileType
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
        profileType: profile.profileType,
        status: profile.status,
        onboardingLink: profile.onboardingLink,
        createdAt: profile.createdAt,
        clientId: profile.clientId,
      });
      // After adding, force refresh for this client
      await fetchProfiles(clientId, true);
    } catch (err) {
      console.error('[ProfilesContext] Error adding profile:', err);
    }
  };

  const deleteProfile = async (clientId: string, profileId: string) => {
    try {
      const profileRef = doc(
        db,
        'agencies',
        'agency1',
        'clients',
        clientId,
        'subClients',
        profileId
      );
      await deleteDoc(profileRef);
      // Remove from cache
      setProfilesByClient(prev => ({
        ...prev,
        [clientId]: (prev[clientId] || []).filter(profile => profile.id !== profileId),
      }));
    } catch (err) {
      console.error('[ProfilesContext] Error deleting profile:', err);
    }
  };

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        loading,
        error,
        fetchProfiles,
        addProfile,
        setActiveClientId,
        deleteProfile,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
};