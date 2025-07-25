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

// LinkedIn Company info structure
export interface LinkedInCompanyInfo {
    linkedinCompanyConnected: boolean;
    linkedinCompanyToken?: string;
    linkedinCompanyExpiryDate: string | null;
    linkedinCompanyAccountName?: string;
    linkedinCompanyProfile?: {
        organization_id: string;
        organization_urn: string;
        company_name: string;
        linkedin_url: string;
        connected_scopes: string;
        expires_at: string;
    };
    connectedAt?: string;
    updatedAt?: string;
}

// LinkedIn info structure as it appears in the profile
export interface LinkedInInfo {
    connectedAt?: string;
    updatedAt?: string;
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
    isCheckingStatus: boolean;
    isDisconnecting: boolean;
    isConnectingCompany: boolean;
    isCheckingCompanyStatus: boolean;
    isDisconnectingCompany: boolean;
    connectLinkedIn: (profileId: string, agencyId: string, clientId: string) => Promise<void>;
    checkLinkedInStatus: (profileId: string, agencyId: string, clientId: string) => Promise<any>;
    disconnectLinkedIn: (profileId: string, agencyId: string, clientId: string) => Promise<void>;
    connectLinkedInCompany: (profileId: string, agencyId: string, clientId: string) => Promise<void>;
    checkLinkedInCompanyStatus: (profileId: string, agencyId: string, clientId: string) => Promise<any>;
    disconnectLinkedInCompany: (profileId: string, agencyId: string, clientId: string) => Promise<void>;
    refreshProfile: (clientId?: string, agencyId?: string) => void;
}

const LinkedinContext = createContext<LinkedinContextType>({
    isConnecting: false,
    isCheckingStatus: false,
    isDisconnecting: false,
    isConnectingCompany: false,
    isCheckingCompanyStatus: false,
    isDisconnectingCompany: false,
    connectLinkedIn: async () => { },
    checkLinkedInStatus: async () => ({}),
    disconnectLinkedIn: async () => { },
    connectLinkedInCompany: async () => { },
    checkLinkedInCompanyStatus: async () => ({}),
    disconnectLinkedInCompany: async () => { },
    refreshProfile: () => { },
});

export const useLinkedin = () => useContext(LinkedinContext);

interface LinkedinProviderProps {
    children: ReactNode;
}

export const LinkedinProvider: React.FC<LinkedinProviderProps> = ({ children }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isConnectingCompany, setIsConnectingCompany] = useState(false);
    const [isCheckingCompanyStatus, setIsCheckingCompanyStatus] = useState(false);
    const [isDisconnectingCompany, setIsDisconnectingCompany] = useState(false);

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
     * Check LinkedIn connection status
     * @param profileId The profile ID to check
     * @param agencyId The agency ID
     * @param clientId The client ID
     */
    const checkLinkedInStatus = async (profileId: string, agencyId: string, clientId: string): Promise<any> => {
        try {
            setIsCheckingStatus(true);

            const response = await fetch(`${BASE_URL}/linkedin/status/${agencyId}/${clientId}/${profileId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking LinkedIn status:', error);
            throw error;
        } finally {
            setIsCheckingStatus(false);
        }
    };

    /**
     * Disconnect LinkedIn account
     * @param profileId The profile ID to disconnect
     * @param agencyId The agency ID
     * @param clientId The client ID
     */
    const disconnectLinkedIn = async (profileId: string, agencyId: string, clientId: string): Promise<void> => {
        try {
            setIsDisconnecting(true);

            // Using GET method as specified in the requirements
            const response = await fetch(`${BASE_URL}/linkedin/disconnect/${agencyId}/${clientId}/${profileId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // If the response is HTML (confirmation page), we might want to open it in a new window
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                // Open the confirmation page in a new window
                window.open(`${BASE_URL}/linkedin/disconnect/${agencyId}/${clientId}/${profileId}`, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
            }
        } catch (error) {
            console.error('Error disconnecting LinkedIn:', error);
            throw error;
        } finally {
            setIsDisconnecting(false);
        }
    };

    /**
     * Initiates LinkedIn Company OAuth flow
     * @param profileId The profile ID to connect
     * @param agencyId The agency ID
     * @param clientId The client ID
     */
    const connectLinkedInCompany = async (profileId: string, agencyId: string, clientId: string): Promise<void> => {
        try {
            setIsConnectingCompany(true);

            // Build the authorization URL with query parameters
            const params = new URLSearchParams({
                profile_id: profileId,
                agency_id: agencyId,
                client_id: clientId
            });

            const response = await fetch(`${BASE_URL}/linkedin/company/authorize?${params.toString()}`, {
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
            console.error('Error initiating LinkedIn Company connection:', error);
            throw error;
        } finally {
            setIsConnectingCompany(false);
        }
    };

    /**
     * Check LinkedIn Company connection status
     * @param profileId The profile ID to check
     * @param agencyId The agency ID
     * @param clientId The client ID
     */
    const checkLinkedInCompanyStatus = async (profileId: string, agencyId: string, clientId: string): Promise<any> => {
        try {
            setIsCheckingCompanyStatus(true);

            const response = await fetch(`${BASE_URL}/linkedin/company/status/${agencyId}/${clientId}/${profileId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking LinkedIn Company status:', error);
            throw error;
        } finally {
            setIsCheckingCompanyStatus(false);
        }
    };

    /**
     * Disconnect LinkedIn Company Page
     * @param profileId The profile ID to disconnect
     * @param agencyId The agency ID
     * @param clientId The client ID
     */
    const disconnectLinkedInCompany = async (profileId: string, agencyId: string, clientId: string): Promise<void> => {
        try {
            setIsDisconnectingCompany(true);

            // Using DELETE method as specified in the requirements
            const response = await fetch(`${BASE_URL}/linkedin/company/disconnect/${agencyId}/${clientId}/${profileId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // If the response is HTML (confirmation page), we might want to open it in a new window
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                // Open the confirmation page in a new window
                window.open(`${BASE_URL}/linkedin/company/disconnect/${agencyId}/${clientId}/${profileId}`, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
            }
        } catch (error) {
            console.error('Error disconnecting LinkedIn Company:', error);
            throw error;
        } finally {
            setIsDisconnectingCompany(false);
        }
    };

    /**
     * Refreshes the current page to reflect updated LinkedIn connection status
     * @param clientId Optional client ID to force refresh specific client profiles
     * @param agencyId Optional agency ID for targeted refresh
     */
    const refreshProfile = (clientId?: string, agencyId?: string) => {
        // For now, we'll just reload the page to refresh all data
        // In the future, you could implement selective refresh using the ProfilesContext
        window.location.reload();
    };

    const value: LinkedinContextType = {
        isConnecting,
        isCheckingStatus,
        isDisconnecting,
        isConnectingCompany,
        isCheckingCompanyStatus,
        isDisconnectingCompany,
        connectLinkedIn,
        checkLinkedInStatus,
        disconnectLinkedIn,
        connectLinkedInCompany,
        checkLinkedInCompanyStatus,
        disconnectLinkedInCompany,
        refreshProfile,
    };

    return (
        <LinkedinContext.Provider value={value}>
            {children}
        </LinkedinContext.Provider>
    );
};
