import React, { createContext, useContext, useState, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

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
  updatedAt?: string;
  linkedinProfile?: LinkedInProfile;
  // Company LinkedIn fields
  linkedinCompanyConnected?: boolean;
  linkedinCompanyToken?: string;
  linkedinCompanyExpiryDate?: string | null;
  linkedinCompanyAccountName?: string;
  linkedinCompanyProfile?: {
    organization_id: string;
    organization_urn: string;
    company_name: string;
    linkedin_url: string;
    connected_scopes: string;
    expires_at: string;
  };
  linkedinCompanyConnectedAt?: string;
  linkedinCompanyUpdatedAt?: string;
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
  expertise?: string;
  contentLanguage: string;
  personalStories?: string;
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
  profileType?: string;
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
      profileType?: string;
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

// Helper function to get profile with dynamic agency ID
export const getPersonProfile = async (agencyId: string, clientId: string, profileId: string): Promise<Profile> => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  const profileRef = doc(
    db,
    'agencies',
    agencyId,
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
    onboardingLink: data.onboardingLink || '',
    id: snap.id,
    linkedin: {
      profileImage: data.linkedin?.profileImage || data.linkedin?.linkedinProfile?.picture || '',
      linkedinAccountName: data.linkedin?.linkedinAccountName || data.linkedin?.linkedinProfile?.name || '',
      linkedinName: data.linkedin?.linkedinName || data.linkedin?.linkedinProfile?.given_name || '',
      linkedinConnected: !!data.linkedin?.linkedinConnected,
      linkedinExpiryDate: data.linkedin?.linkedinExpiryDate || null,
      linkedinToken: data.linkedin?.linkedinToken || data.linkedin?.linkedinProfile?.linkedinToken || '',
      connectedAt: data.linkedin?.connectedAt || '',
      updatedAt: data.linkedin?.updatedAt || '',
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
    status: data.status || '',
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
      favPosts: data.contentProfile?.favPosts || [],
      addHashtags: !!data.contentProfile?.addHashtags,
    },
    contactEmail: data.contactEmail || '',
  };
};

// Fetch a company profile by clientId and profileId
export const getCompanyProfile = async (agencyId: string, clientId: string, profileId: string): Promise<CompanyProfile> => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  const profileRef = doc(
    db,
    'agencies',
    agencyId,
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
      updatedAt: data.linkedin?.updatedAt || '',
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
      addHashtags: !!data.contentProfile?.addHashtags,
    },
    location: data.location || '',
  };
};

// Update functions for profile data with dynamic agency ID
export const updatePersonProfileInfo = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    profileName?: string;
    role?: string;
    joinedDate?: string;
    location?: string;
    contactEmail?: string;
    status?: string;
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );
    await setDoc(profileRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating profile info:', error);
    throw error;
  }
};

export const updatePersonProfileStrategy = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    primaryGoal?: string;
    audienceFocus?: string;
    expertise?: string;
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      ...updates
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating profile strategy:', error);
    throw error;
  }
};

export const updatePersonProfileVoice = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    contentPersona?: string;
    coreTones?: string;
    postLength?: string;
    emojiUsage?: string;
    addHashtags?: boolean;
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      ...updates
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating profile voice:', error);
    throw error;
  }
};

export const updatePersonProfileGuidelines = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    hotTakes?: string;
    personalStories?: string;
    hookGuidelines?: string;
    sampleCTA?: string;
    topicsToAvoid?: string[];
    favPosts?: string[];
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      ...updates
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating profile guidelines:', error);
    throw error;
  }
};

export const updatePersonProfileCustomInstructions = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  customInstructions: string
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      customInstructions: customInstructions
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating custom instructions:', error);
    throw error;
  }
};

// Company profile update functions with dynamic agency ID
export const updateCompanyProfileInfo = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    profileName?: string;
    role?: string;
    foundationDate?: string;
    location?: string;
    contactEmail?: string;
    status?: string;
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );
    await setDoc(profileRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating company profile info:', error);
    throw error;
  }
};

export const updateCompanyProfileBrandStrategy = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    primaryGoal?: string;
    audienceFocus?: string;
    contentPersona?: string;
    coreTones?: string;
    postLength?: string;
    emojiUsage?: string;
    addHashtags?: boolean;
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Company profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      ...updates
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating company profile brand strategy:', error);
    throw error;
  }
};

export const updateCompanyProfileContentGuidelines = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  updates: {
    hookGuidelines?: string;
    hotTakes?: string;
    sampleCTA?: string;
    topicsToAvoid?: string[];
    favPosts?: string[];
  }
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Company profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      ...updates
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating company profile content guidelines:', error);
    throw error;
  }
};

export const updateCompanyProfileCustomInstructions = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  customInstructions: string
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Company profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      customInstructions: customInstructions
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating company profile custom instructions:', error);
    throw error;
  }
};

export const updateCompanyProfileLanguage = async (
  agencyId: string,
  clientId: string,
  profileId: string,
  contentLanguage: string
) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );

    // Get current profile data
    const snap = await getDoc(profileRef);
    if (!snap.exists()) throw new Error('Company profile not found');
    const currentData = snap.data();

    // Update the contentProfile object
    const updatedContentProfile = {
      ...currentData.contentProfile,
      contentLanguage: contentLanguage
    };

    await setDoc(profileRef, {
      contentProfile: updatedContentProfile
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error updating company profile language:', error);
    throw error;
  }
};

export const deletePersonProfile = async (agencyId: string, clientId: string, profileId: string) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );
    await deleteDoc(profileRef);
    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error deleting profile:', error);
    throw error;
  }
};

export const deleteCompanyProfile = async (agencyId: string, clientId: string, profileId: string) => {
  if (!agencyId) {
    throw new Error('No agency ID available');
  }

  try {
    const profileRef = doc(
      db,
      'agencies',
      agencyId,
      'clients',
      clientId,
      'subClients',
      profileId
    );
    await deleteDoc(profileRef);
    return true;
  } catch (error) {
    console.error('[ProfilesContext] Error deleting company profile:', error);
    throw error;
  }
};

export const ProfilesProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();

  // Store profiles by clientId
  const [profilesByClient, setProfilesByClient] = useState<Record<string, ProfileCard[]>>({});
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current agency ID from the authenticated user
  const agencyId = currentUser?.uid;

  // Expose only the profiles for the active client
  const profiles = activeClientId ? profilesByClient[activeClientId] || [] : [];

  // Fetch only if not cached, unless force is true
  const fetchProfiles = async (clientId: string, force = false) => {
    if (!agencyId) {
      console.warn('[ProfilesContext] No agency ID available, skipping fetch');
      return;
    }

    if (!force && profilesByClient[clientId]) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('[ProfilesContext] Fetching profiles for agency:', agencyId, 'client:', clientId);
      const subClientsRef = collection(
        db,
        'agencies',
        agencyId,
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
        profileType: doc.data().profileType || '',
        onboardingLink: doc.data().onboardingLink || '',
        createdAt: doc.data().createdAt
          ? new Date(
            doc.data().createdAt.seconds
              ? doc.data().createdAt.seconds * 1000
              : doc.data().createdAt
          )
          : undefined,
      }));

      console.log('[ProfilesContext] Fetched profiles:', fetchedProfiles.length);
      setProfilesByClient(prev => ({
        ...prev,
        [clientId]: fetchedProfiles,
      }));
    } catch (err: any) {
      console.error('[ProfilesContext] Error fetching profiles:', err);
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
      profileType?: string;
      status: string;
      onboardingLink: string;
      createdAt: Date;
      clientId: string;
    }
  ) => {
    if (!agencyId) {
      console.error('[ProfilesContext] No agency ID available for adding profile');
      return;
    }

    try {
      console.log('[ProfilesContext] Adding profile for agency:', agencyId, 'client:', clientId);
      const profileRef = doc(
        db,
        'agencies',
        agencyId,
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
      setError(err instanceof Error ? err.message : 'Failed to add profile');
    }
  };

  const deleteProfile = async (clientId: string, profileId: string) => {
    if (!agencyId) {
      console.error('[ProfilesContext] No agency ID available for deleting profile');
      return;
    }

    try {
      console.log('[ProfilesContext] Deleting profile for agency:', agencyId, 'client:', clientId, 'profile:', profileId);
      const profileRef = doc(
        db,
        'agencies',
        agencyId,
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
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
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