import React, { createContext, useContext, useState, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --- Types for Person Profile ---
export type LinkedInProfile = {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: string;
  name: string;
  picture: string;
  linkedinRefreshToken: string | null;
  linkedinScope: string;
  linkedinToken: string;
  linkedinUserId: string;
};

export type LinkedInInfo = {
  profileImage: string;
  linkedinAccountName: string;
  linkedinName: string;
  linkedinConnected: boolean;
  linkedinExpiryDate: string | null;
  linkedinToken: string;
  connectedAt?: string;
  lastUpdated?: string;
  linkedinProfile?: LinkedInProfile;
};

export type ContentProfile = {
  customInstructions: string;
  hookGuidelines: string;
  hotTakes: string;
  primaryGoal: string;
  coreTones: string;
  audienceFocus: string;
  contentPersona: string;
  topicsToAvoid: string[];
  emojiUsage: string;
  sampleCTA: string;
  expertise?: string; // Mark as optional
  contentLanguage: string;
  personalStories?: string; // Mark as optional
  postLength: string;
  favPosts: string[];
  addHashtags: boolean;
};

export type Profile = {
  profileType: string;
  location: string;
  profileName: string;
  joinedDate: string;
  onboardingLink: string;
  id: string;
  linkedin: LinkedInInfo;
  role: string;
  createdAt: string;
  status: string;
  clientId: string;
  contentProfile: ContentProfile;
  contactEmail: string;
};

export type ProfileCard = {
  id: string;
  profileName: string;
  status?: string;
  role?: string;
  profileType?: string; // Optional, if you want to include profileType
  onboardingLink?: string;
  createdAt?: Date;
};

export type CompanyProfile = {
  onboardingLink: string;
  id: string;
  status: string;
  clientId: string;
  foundationDate: string | null;
  contactEmail: string;
  profileType: string;
  updatedAt: string;
  linkedin: LinkedInInfo;
  role: string;
  createdAt: string;
  profileName: string;
  contentProfile: ContentProfile;
  location: string;
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
  fetchProfiles: async () => { },
  addProfile: async () => { },
  deleteProfile: async () => { },
  setActiveClientId: () => { },
});

export const useProfiles = () => useContext(ProfilesContext);

// Move this function outside ProfilesProvider if needed, or just export it here:
export const getPersonProfile = async (clientId: string, profileId: string): Promise<Profile> => {
  const profileRef = doc(
    db,
    'agencies',
    'agency1',
    'clients',
    clientId,
    'subClients',
    profileId
  );
  const snap = await getDoc(profileRef);
  if (!snap.exists()) throw new Error('Profile not found');
  const data = snap.data();

  return {
    profileType: data.profileType || '',
    location: data.location || '',
    profileName: data.profileName || '',
    joinedDate: data.joinedDate?.seconds ?
      new Date(data.joinedDate.seconds * 1000).toISOString() :
      (data.joinedDate || ''),
    onboardingLink: data.onboardingLink || '', // Make sure this is included
    id: snap.id,
    linkedin: {
      profileImage: data.linkedin?.profileImage || data.linkedin?.linkedinProfile?.picture || '',
      linkedinAccountName: data.linkedin?.linkedinAccountName || data.linkedin?.linkedinProfile?.name || '',
      linkedinName: data.linkedin?.linkedinName || data.linkedin?.linkedinProfile?.given_name || '',
      linkedinConnected: !!data.linkedin?.linkedinConnected,
      linkedinExpiryDate: data.linkedin?.linkedinExpiryDate || null,
      linkedinToken: data.linkedin?.linkedinToken || data.linkedin?.linkedinProfile?.linkedinToken || '',
      connectedAt: data.linkedin?.connectedAt || '',
      lastUpdated: data.linkedin?.lastUpdated || '',
      linkedinProfile: data.linkedin?.linkedinProfile ? {
        email: data.linkedin.linkedinProfile.email || '',
        email_verified: !!data.linkedin.linkedinProfile.email_verified,
        family_name: data.linkedin.linkedinProfile.family_name || '',
        given_name: data.linkedin.linkedinProfile.given_name || '',
        locale: data.linkedin.linkedinProfile.locale || '',
        name: data.linkedin.linkedinProfile.name || '',
        picture: data.linkedin.linkedinProfile.picture || '',
        linkedinRefreshToken: data.linkedin.linkedinProfile.linkedinRefreshToken || null,
        linkedinScope: data.linkedin.linkedinProfile.linkedinScope || '',
        linkedinToken: data.linkedin.linkedinProfile.linkedinToken || '',
        linkedinUserId: data.linkedin.linkedinProfile.linkedinUserId || '',
      } : undefined,
    },
    role: data.role || '',
    createdAt: data.createdAt?.seconds ?
      new Date(data.createdAt.seconds * 1000).toISOString() :
      (data.createdAt || ''), // Make sure this is included
    status: data.status || '', // Make sure this is included
    clientId: data.clientId || '',
    contentProfile: {
      customInstructions: data.contentProfile?.customInstructions || '',
      hookGuidelines: data.contentProfile?.hookGuidelines || '',
      hotTakes: data.contentProfile?.hotTakes || '',
      primaryGoal: data.contentProfile?.primaryGoal || '',
      coreTones: data.contentProfile?.coreTones || '',
      audienceFocus: data.contentProfile?.audienceFocus || '',
      contentPersona: data.contentProfile?.contentPersona || '',
      topicsToAvoid: data.contentProfile?.topicsToAvoid || [],
      emojiUsage: data.contentProfile?.emojiUsage || '',
      sampleCTA: data.contentProfile?.sampleCTA || '',
      expertise: data.contentProfile?.expertise || '',
      contentLanguage: data.contentProfile?.contentLanguage || '',
      personalStories: data.contentProfile?.personalStories || '',
      postLength: data.contentProfile?.postLength || '',
      favPosts: data.contentProfile?.favPosts || [], // Make sure this is included
      addHashtags: !!data.contentProfile?.addHashtags, // Make sure this is included
    },
    contactEmail: data.contactEmail || '', // Make sure this is included
  };
};

// Fetch a company profile by clientId and profileId
export const getCompanyProfile = async (clientId: string, profileId: string): Promise<CompanyProfile> => {
  const profileRef = doc(
    db,
    'agencies',
    'agency1',
    'clients',
    clientId,
    'subClients',
    profileId
  );
  const snap = await getDoc(profileRef);
  if (!snap.exists()) throw new Error('Company profile not found');
  const data = snap.data();

  return {
    onboardingLink: data.onboardingLink || '',
    id: snap.id,
    status: data.status || '',
    clientId: data.clientId || '',
    foundationDate: data.foundationDate || null,
    contactEmail: data.contactEmail || '',
    profileType: data.profileType || '',
    updatedAt: data.updatedAt || '',
    linkedin: {
      profileImage: data.linkedin?.profileImage || data.linkedin?.linkedinProfile?.picture || '',
      linkedinAccountName: data.linkedin?.linkedinAccountName || data.linkedin?.linkedinProfile?.name || '',
      linkedinName: data.linkedin?.linkedinName || data.linkedin?.linkedinProfile?.given_name || '',
      linkedinConnected: !!data.linkedin?.linkedinConnected,
      linkedinExpiryDate: data.linkedin?.linkedinExpiryDate || null,
      linkedinToken: data.linkedin?.linkedinToken || data.linkedin?.linkedinProfile?.linkedinToken || '',
      connectedAt: data.linkedin?.connectedAt || '',
      lastUpdated: data.linkedin?.lastUpdated || '',
      linkedinProfile: data.linkedin?.linkedinProfile ? {
        email: data.linkedin.linkedinProfile.email || '',
        email_verified: !!data.linkedin.linkedinProfile.email_verified,
        family_name: data.linkedin.linkedinProfile.family_name || '',
        given_name: data.linkedin.linkedinProfile.given_name || '',
        locale: data.linkedin.linkedinProfile.locale || '',
        name: data.linkedin.linkedinProfile.name || '',
        picture: data.linkedin.linkedinProfile.picture || '',
        linkedinRefreshToken: data.linkedin.linkedinProfile.linkedinRefreshToken || null,
        linkedinScope: data.linkedin.linkedinProfile.linkedinScope || '',
        linkedinToken: data.linkedin.linkedinProfile.linkedinToken || '',
        linkedinUserId: data.linkedin.linkedinProfile.linkedinUserId || '',
      } : undefined,
    },
    role: data.role || '',
    createdAt: data.createdAt?.seconds ?
      new Date(data.createdAt.seconds * 1000).toISOString() :
      (data.createdAt || ''),
    profileName: data.profileName || '',
    contentProfile: {
      customInstructions: data.contentProfile?.customInstructions || '',
      favPosts: data.contentProfile?.favPosts || [],
      hookGuidelines: data.contentProfile?.hookGuidelines || '',
      emojiUsage: data.contentProfile?.emojiUsage || '',
      sampleCTA: data.contentProfile?.sampleCTA || '',
      primaryGoal: data.contentProfile?.primaryGoal || '',
      contentLanguage: data.contentProfile?.contentLanguage || '',
      hotTakes: data.contentProfile?.hotTakes || '',
      coreTones: data.contentProfile?.coreTones || '',
      audienceFocus: data.contentProfile?.audienceFocus || '',
      postLength: data.contentProfile?.postLength || '',
      contentPersona: data.contentProfile?.contentPersona || '',
      topicsToAvoid: data.contentProfile?.topicsToAvoid || [],
      addHashtags: !!data.contentProfile?.addHashtags, // Add this field
    },
    location: data.location || '',
  };
};

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