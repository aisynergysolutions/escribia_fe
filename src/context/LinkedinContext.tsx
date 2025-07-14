import React, { createContext, useContext, useState, ReactNode } from 'react';

const BASE_URL = 'https://web-production-2fc1.up.railway.app/api/v1';

// LinkedIn Profile data structure
export interface LinkedInProfile {
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
}

// LinkedIn info structure as it appears in the profile
export interface LinkedInInfo {
  connectedAt?: string;
  lastUpdated?: string;
  linkedinAccountName: string;
  linkedinConnected: boolean;
  linkedinExpiryDate: string | null;
  linkedinName: string;
  linkedinProfile?: LinkedInProfile;
  profileImage?: string;
  linkedinToken?: string;
}

interface LinkedinContextType {
  isConnecting: boolean;
  connectLinkedIn: (profileId: string, agencyId: string, clientId: string) => Promise<void>;
  refreshProfile: (clientId?: string) => void;
}

const LinkedinContext = createContext<LinkedinContextType>({
  isConnecting: false,
  connectLinkedIn: async () => {},
  refreshProfile: () => {},
});

export const useLinkedin = () => useContext(LinkedinContext);

interface LinkedinProviderProps {
  children: ReactNode;
}

export const LinkedinProvider: React.FC<LinkedinProviderProps> = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Initiates LinkedIn OAuth flow
   * @param profileId The profile ID to connect
   * @param agencyId The agency ID
   * @param clientId The client ID
   */
  const connectLinkedIn = async (profileId: string, agencyId: string, clientId: string): Promise<void> => {
    try {
      setIsConnecting(true);

      // Build the authorization URL with query parameters
      const params = new URLSearchParams({
        profile_id: profileId,
        agency_id: agencyId,
        client_id: clientId
      });

      const response = await fetch(`${BASE_URL}/linkedin/authorize?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.authorization_url) {
        // Open the authorization URL in a new window/tab
        window.open(data.authorization_url, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Error initiating LinkedIn connection:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Refreshes the current page to reflect updated LinkedIn connection status
   * @param clientId Optional client ID to force refresh specific client profiles
   */
  const refreshProfile = (clientId?: string) => {
    // For now, we'll just reload the page to refresh all data
    // In the future, you could implement selective refresh using the ProfilesContext
    window.location.reload();
  };

  const value: LinkedinContextType = {
    isConnecting,
    connectLinkedIn,
    refreshProfile,
  };

  return (
    <LinkedinContext.Provider value={value}>
      {children}
    </LinkedinContext.Provider>
  );
};
